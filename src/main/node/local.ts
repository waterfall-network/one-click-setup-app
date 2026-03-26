/*
 * Copyright 2026 Digital Clever Solution Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import * as crypto from 'crypto'
import log from 'electron-log/node'
import { execFile } from 'node:child_process'
import Child, { StatusResult } from './child'
import {
  checkOrCreateDir,
  checkOrCreateFile,
  checkPort,
  checkSocket,
  appendToFile,
  deleteFolderRecursive,
  deleteFile,
  deleteFilesByCoordinatorPublicKeys,
  deleteFilesByValidatorPublicKeys,
  getPublicIP
} from '../libs/fs'
import AppEnv from '../libs/appEnv'
import {
  Network,
  getLocationPath,
  getCoordinatorNetwork,
  getCoordinatorPath,
  getCoordinatorWalletPath,
  getCoordinatorKeysPath,
  getCoordinatorBootnode,
  getLogPath,
  getValidatorNetwork,
  getValidatorPath,
  getValidatorPasswordPath,
  getValidatorAddress,
  getValidatorBootnode,
  getCoordinatorWalletPasswordPath,
  getCoordinatorKeyPath,
  getValidatorKeystorePath,
  getSnapshotPath,
  getValidatorNodeKeyPath
} from '../libs/env'

import {
  Node,
  ValidatorStatus as NodeValidatorStatus,
  CoordinatorStatus as NodeCoordinatorStatus,
  DownloadStatus
} from '../models/node'
import { EventEmitter } from 'node:events'
import { ValidatorStatus, Worker as WorkerModelType, WorkerStatus } from '../models/worker'
import { isValidatorInfo, isEraInfo } from '../helpers/worker'

import Web3 from 'web3'
import { Key, PublicKey } from '../worker'
import { isSyncInfo, isWatInfo } from '../helpers/node'
import { getCurrentDateUTC } from '../helpers/common'

import DownloadFile from '../libs/downloadFile'
import { clearInterval } from 'node:timers'
import * as rfs from 'rotating-file-stream'
import BinUpdater from '../libs/binUpdater'

export { StatusResult }

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error)

const truncateValue = (value: string, maxLength = 180): string =>
  value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value

export type StatusResults = {
  coordinatorBeacon: StatusResult
  coordinatorValidator: StatusResult
  validator: StatusResult
}

export type removeWorkersResponse = {
  id: number | bigint
  status: boolean
}

class LocalNode extends EventEmitter {
  public static readonly BINARIES_NOT_READY_ERROR =
    'Node binaries are not ready. Please download them first.'

  private readonly appEnv: AppEnv
  private readonly model: Node | null
  private readonly binUpdater: BinUpdater | null

  private coordinatorBeacon: Child | null
  private coordinatorValidator: Child | null
  private validator: Child | null
  private download: DownloadFile | null = null
  private ip: string | null = null
  private startTime: Date | null = null
  private monitoringInterval: NodeJS.Timeout | null = null
  private monitoringLogStream: rfs.RotatingFileStream | null = null
  private monitoringWorking = false

  constructor(model: Node | undefined, appEnv: AppEnv, binUpdater: BinUpdater | null = null) {
    super()
    this.appEnv = appEnv
    this.binUpdater = binUpdater
    this.model = model || null
    this.coordinatorBeacon = null
    this.coordinatorValidator = null
    this.validator = null
  }

  public async initialize(): Promise<StatusResults> {
    this.ip = await getPublicIP()
    const results: StatusResults = {
      coordinatorBeacon: StatusResult.fail,
      validator: StatusResult.fail,
      coordinatorValidator: StatusResult.fail
    }
    if (this.model === null) {
      return results
    }
    if (!(await this._checkMain())) {
      return results
    }

    results.coordinatorBeacon = (await this._checkCoordinatorBeacon())
      ? StatusResult.success
      : StatusResult.fail
    results.validator = (await this._checkValidator()) ? StatusResult.success : StatusResult.fail
    results.coordinatorValidator = (await this._checkCoordinatorValidator())
      ? StatusResult.success
      : StatusResult.fail

    if (
      results.coordinatorBeacon === StatusResult.fail ||
      results.validator === StatusResult.fail ||
      results.coordinatorValidator === StatusResult.fail
    ) {
      return results
    }

    this._setCoordinatorBeacon()
    this._setValidator()
    this._setCoordinatorValidator()

    this.monitoringLogStream = rfs.createStream('monitoring.log', {
      size: '100M',
      interval: '1d',
      compress: 'gzip',
      maxFiles: 10,
      path: getLogPath(this.model.locationDir)
    })
    return results
  }

  public async start(): Promise<StatusResults> {
    if (!this.binUpdater) {
      log.warn('local-node:start-blocked', {
        nodeId: this.model?.id,
        reason: 'bin-updater-not-configured'
      })
      throw new Error(LocalNode.BINARIES_NOT_READY_ERROR)
    }

    try {
      await this.binUpdater.downloadBinaries()
    } catch (error) {
      log.warn('local-node:start-blocked', {
        nodeId: this.model?.id,
        reason: 'binaries-update-failed',
        error: getErrorMessage(error)
      })
      throw new Error(LocalNode.BINARIES_NOT_READY_ERROR)
    }

    const results: StatusResults = {
      coordinatorBeacon: StatusResult.success,
      validator: StatusResult.success,
      coordinatorValidator: StatusResult.success
    }
    log.debug(`start`)
    if (this.validator && !this.validator.isRunning()) {
      results.validator = await this.validator.start()
      log.debug(`start gwat: ${results.validator}`)
    }

    if (this.coordinatorBeacon && !this.coordinatorBeacon.isRunning()) {
      results.coordinatorBeacon = await this.coordinatorBeacon.start()
      log.debug(`start coord: ${results.coordinatorBeacon}`)
    }

    if (this.coordinatorValidator && !this.coordinatorValidator.isRunning()) {
      results.coordinatorValidator = await this.coordinatorValidator.start()
      log.debug(`start valid: ${results.coordinatorValidator}`)
    }

    this._startMonitoring()
    return results
  }

  public async stop(): Promise<StatusResults> {
    const results: StatusResults = {
      coordinatorBeacon: StatusResult.success,
      validator: StatusResult.success,
      coordinatorValidator: StatusResult.success
    }
    log.debug(`stop`)
    if (this.coordinatorBeacon && this.coordinatorBeacon.isRunning()) {
      results.coordinatorBeacon = await this.coordinatorBeacon.stop()
      log.debug(`stop coord: ${results.coordinatorBeacon}`)
    }

    if (this.coordinatorValidator && this.coordinatorValidator.isRunning()) {
      results.coordinatorValidator = await this.coordinatorValidator.stop()
      log.debug(`stop valid: ${results.coordinatorValidator}`)
    }

    if (this.validator && this.validator.isRunning()) {
      results.validator = await this.validator.stop()
      log.debug(`stop gwat: ${results.validator}`)
    }
    this._stopMonitoring()
    return results
  }

  public async restart(): Promise<StatusResults> {
    const results: StatusResults = {
      coordinatorBeacon: StatusResult.success,
      validator: StatusResult.success,
      coordinatorValidator: StatusResult.success
    }
    if (this.model === null) {
      return results
    }
    log.debug(`restart`)
    if (this.coordinatorValidator && this.coordinatorValidator.isRunning()) {
      const res = await this.coordinatorValidator.stop()
      log.debug(`stop valid: ${res}`)
    }

    if (this.coordinatorBeacon && this.coordinatorBeacon.isRunning()) {
      const res = await this.coordinatorBeacon.stop()
      log.debug(`stop coord: ${res}`)
    }

    if (this.validator && this.validator.isRunning()) {
      const res = await this.validator.stop()
      log.debug(`stop gwat: ${res}`)
    }
    await deleteFile(getValidatorNodeKeyPath(this.model.locationDir))
    if (this.validator) {
      results.validator = await this.validator.start()
      log.debug(`start gwat: ${results.validator}`)
    }
    if (this.coordinatorBeacon) {
      results.coordinatorBeacon = await this.coordinatorBeacon.start()
      log.debug(`start coord: ${results.coordinatorBeacon}`)
    }
    if (this.coordinatorValidator) {
      results.coordinatorValidator = await this.coordinatorValidator.start()
      log.debug(`start valid: ${results.coordinatorValidator}`)
    }
    return results
  }

  public getPids() {
    return {
      coordinatorBeacon: this.coordinatorBeacon ? this.coordinatorBeacon.getPid() : undefined,
      validator: this.validator ? this.validator.getPid() : undefined,
      coordinatorValidator: this.coordinatorValidator
        ? this.coordinatorValidator.getPid()
        : undefined
    }
  }

  public async getPeers() {
    const results: {
      coordinatorPeersCount?: number
      validatorPeersCount?: number
    } = {}
    if (this.model === null) {
      return null
    }
    try {
      const response = await this.runCoordinatorCommand('/eth/v1/node/peer_count')
      if (response && response?.data) {
        results.coordinatorPeersCount = response.data.connected
      }
    } catch (error) {
      log.debug(error)
    }
    try {
      const response = (await this.runValidatorCommand('admin.peers.length')) as string
      if (response !== '') {
        results.validatorPeersCount = parseInt(response)
      }
    } catch (error) {
      log.debug(error)
    }
    return Object.keys(results).length > 0 ? results : null
  }

  public async getSync() {
    const results: {
      coordinatorHeadSlot?: bigint
      coordinatorSyncDistance?: bigint
      coordinatorPreviousJustifiedEpoch?: bigint
      coordinatorCurrentJustifiedEpoch?: bigint
      coordinatorFinalizedEpoch?: bigint
      validatorHeadSlot?: bigint
      validatorSyncDistance?: bigint
      validatorFinalizedSlot?: bigint
    } = {}
    if (this.model === null) {
      return null
    }
    try {
      const response = await this.runCoordinatorCommand('/eth/v1/node/syncing')
      if (response && response?.data) {
        results.coordinatorHeadSlot = BigInt(response.data.head_slot)
        results.coordinatorSyncDistance = BigInt(response.data.sync_distance)
      }
    } catch (error) {
      log.debug(error)
    }
    try {
      const response = await this.runCoordinatorCommand(
        '/eth/v1/beacon/states/head/finality_checkpoints'
      )
      if (response && response?.data) {
        results.coordinatorPreviousJustifiedEpoch = BigInt(response.data.previous_justified.epoch)
        results.coordinatorCurrentJustifiedEpoch = BigInt(response.data.current_justified.epoch)
        results.coordinatorFinalizedEpoch = BigInt(response.data.finalized.epoch)
      }
    } catch (error) {
      log.debug(error)
    }

    try {
      const response = await this.runValidatorCommand('eth.syncing', 'json')

      if (response && isSyncInfo(response)) {
        const currentSlot = response.currentSlot
        const finalizedSlot = response.finalizedSlot
        results.validatorHeadSlot = BigInt(finalizedSlot)
        results.validatorSyncDistance = BigInt(currentSlot) - BigInt(finalizedSlot)
        results.validatorFinalizedSlot = BigInt(finalizedSlot)
      } else {
        const response = await this.runValidatorCommand('wat.info', 'json')

        if (isWatInfo(response)) {
          results.validatorHeadSlot = BigInt(response.currSlot)
          // results.validatorSyncDistance = BigInt(response.currSlot) - BigInt(response.maxDagSlot)
          results.validatorSyncDistance = BigInt(0)
          results.validatorFinalizedSlot = BigInt(response.cpSlot)
        }
      }
    } catch (error) {
      log.debug(error)
    }
    return Object.keys(results).length > 0 ? results : null
  }

  public async getWorkerStatuses(workers: WorkerModelType[]) {
    return Promise.all(workers.map((worker) => this.getWorkerStatus(worker)))
  }
  public async getWorkerStatus(worker: WorkerModelType) {
    const results: WorkerStatus = {
      coordinatorPublicKey: worker.coordinatorPublicKey,
      validatorAddress: worker.validatorAddress,
      coordinatorStatus: worker.coordinatorStatus,
      coordinatorBalanceAmount: worker.coordinatorBalanceAmount,
      coordinatorActivationEpoch: worker.coordinatorActivationEpoch,
      coordinatorDeActivationEpoch: worker.coordinatorDeActivationEpoch,
      validatorStatus: worker.validatorStatus,
      validatorBalanceAmount: worker.validatorBalanceAmount,
      validatorActivationEpoch: worker.validatorActivationEpoch,
      validatorDeActivationEpoch: worker.validatorDeActivationEpoch,
      stakeAmount: worker.stakeAmount,
      validatorIndex: worker.validatorIndex
    }
    if (this.model === null) {
      return results
    }

    try {
      const coordinatorResponse = await this.runCoordinatorCommand(
        `/eth/v1/beacon/states/head/validators/0x${worker.coordinatorPublicKey}`
      )

      if (coordinatorResponse?.data) {
        results.coordinatorStatus = coordinatorResponse.data.status
        results.coordinatorBalanceAmount = Web3.utils.fromWei(
          Web3.utils.toWei(coordinatorResponse.data.balance, 'gwei'),
          'ether'
        )
        if (coordinatorResponse.data.validator.activation_epoch !== '18446744073709551615') {
          results.coordinatorActivationEpoch = coordinatorResponse.data.validator.activation_epoch
        }
        if (coordinatorResponse.data.validator.exit_epoch !== '18446744073709551615') {
          results.coordinatorDeActivationEpoch = coordinatorResponse.data.validator.exit_epoch
        }
        results.stakeAmount = Web3.utils.fromWei(
          Web3.utils.toWei(coordinatorResponse.data.validator.effective_balance, 'gwei'),
          'ether'
        )
        results.validatorIndex = parseInt(coordinatorResponse.data.index)
      }
    } catch (e) {
      log.error(e)
    }

    try {
      const [validatorResponse, currentEra, validatorBalanceAmount] = await Promise.all([
        this.runValidatorCommand(
          `wat.validator.getInfo('0x${worker.validatorAddress}')`,
          'json'
        ).catch(() => null),
        this.runValidatorCommand('wat.getEra()', 'json'),
        this.runValidatorCommand(`eth.getBalance('0x${worker.validatorAddress}')`)
      ])
      if (isValidatorInfo(validatorResponse)) {
        let activationEra: null | object | string = null
        let exitEra: null | object | string = null
        try {
          activationEra =
            validatorResponse.activationEra === 18446744073709552000
              ? null
              : await this.runValidatorCommand(
                  `wat.getEra(${validatorResponse.activationEra})`,
                  'json'
                )
        } catch (e) {
          log.error(e)
        }
        try {
          exitEra =
            validatorResponse.exitEra === 18446744073709552000
              ? null
              : await this.runValidatorCommand(`wat.getEra(${validatorResponse.exitEra})`, 'json')
        } catch (e) {
          log.error(e)
        }

        results.validatorStatus = ValidatorStatus.pending_initialized
        if (isEraInfo(currentEra)) {
          if (validatorResponse.activationEra !== 18446744073709552000) {
            results.validatorStatus =
              validatorResponse.activationEra <= currentEra.number
                ? ValidatorStatus.active
                : ValidatorStatus.pending_activation
          }
          if (isEraInfo(activationEra)) {
            results.validatorActivationEpoch = activationEra.fromEpoch.toString()
          } else if (validatorResponse.activationEra === currentEra.number + 1) {
            results.validatorActivationEpoch = (currentEra.toEpoch + 1).toString()
          }

          if (validatorResponse.exitEra !== 18446744073709552000) {
            results.validatorStatus =
              validatorResponse.exitEra <= currentEra.number
                ? ValidatorStatus.exited
                : ValidatorStatus.pending_exiting
          }
          if (isEraInfo(exitEra)) {
            results.validatorDeActivationEpoch = exitEra.fromEpoch.toString()
          } else if (validatorResponse.exitEra === currentEra.number + 1) {
            results.validatorDeActivationEpoch = (currentEra.toEpoch + 1).toString()
          }
        }
      }
      if (validatorBalanceAmount && typeof validatorBalanceAmount === 'string') {
        results.validatorBalanceAmount = Web3.utils.fromWei(validatorBalanceAmount, 'ether')
      }
    } catch (e) {
      log.error(e)
    }

    return results
  }

  private async _checkMain(): Promise<boolean> {
    if (this.model === null) {
      return false
    }
    if (!(await checkOrCreateDir(this.model.locationDir))) {
      return false
    }
    if (!(await checkOrCreateDir(getLogPath(this.model.locationDir)))) {
      return false
    }
    if (!(await checkOrCreateDir(getCoordinatorPath(this.model.locationDir)))) {
      return false
    }
    if (!(await checkOrCreateDir(getValidatorPath(this.model.locationDir)))) {
      return false
    }
    if (!(await checkOrCreateDir(getValidatorKeystorePath(this.model.locationDir)))) {
      return false
    }

    if (!(await checkOrCreateDir(getCoordinatorWalletPath(this.model.locationDir)))) {
      return false
    }
    if (!(await checkOrCreateDir(getCoordinatorKeysPath(this.model.locationDir)))) {
      return false
    }

    const checkPassword = await checkOrCreateFile(
      getValidatorPasswordPath(this.model.locationDir),
      ''
    )
    if (null === checkPassword) {
      return false
    }

    const password = crypto.randomBytes(16).toString('hex')

    const savedPassword = await checkOrCreateFile(
      getCoordinatorWalletPasswordPath(this.model.locationDir),
      password
    )
    if (!savedPassword) {
      return false
    }

    return true
  }

  private async _checkCoordinatorBeacon(): Promise<boolean> {
    if (this.model === null) {
      return false
    }
    if (!(await checkPort(this.model.coordinatorHttpApiPort))) {
      return false
    }
    if (!(await checkPort(this.model.coordinatorHttpValidatorApiPort))) {
      return false
    }
    if (!(await checkPort(this.model.coordinatorP2PTcpPort))) {
      return false
    }
    if (!(await checkPort(this.model.coordinatorP2PUdpPort))) {
      return false
    }

    return true
  }

  private async _checkValidator(): Promise<boolean> {
    if (this.model === null) {
      return false
    }
    // if (!(await checkFile(`${getValidatorPath(this.model.locationDir)}/gwat/nodekey`))) {
    //
    //   const promise: Promise<string> = new Promise((resolve, reject) => {
    //     if (this.model === null) {
    //       return reject('')
    //     }
    //     exec(
    //       `${this.appEnv.getValidatorBinPath(this.model.network)} init ${this.appEnv.getValidatorGenesisPath(this.model.network)} ${this.appEnv.getValidatorGenesisDataPath(this.model.network)}`,
    //       (err, stdout, stderr) => {
    //         if (err) {
    //           return reject(err)
    //         }
    //         if (stderr) {
    //           return resolve(stderr)
    //         }
    //         if (stdout) {
    //           return resolve(stdout)
    //         }
    //       }
    //     )
    //   })
    //   const result = await promise
    //   log.debug(result)
    //   if (!result.search('Successfully wrote genesis state')) {
    //     return false
    //   }
    //
    // }

    if (!(await checkPort(this.model.validatorP2PPort))) {
      return false
    }
    if (!(await checkPort(this.model.validatorHttpApiPort))) {
      return false
    }
    if (!(await checkPort(this.model.validatorWsApiPort))) {
      return false
    }

    return true
  }

  private async _checkCoordinatorValidator(): Promise<boolean> {
    if (this.model === null) {
      return false
    }

    return true
  }

  private _setCoordinatorBeacon(): boolean {
    if (this.model === null || this.coordinatorBeacon !== null) {
      return false
    }
    const args = [
      '--accept-terms-of-use',
      '--disable-peer-scorer',
      `${getCoordinatorNetwork(this.model.network)}`,
      `--datadir=${getCoordinatorPath(this.model.locationDir)}`,
      // `--bootstrap-node=${getCoordinatorBootnode(this.model.network)}`,
      // `--genesis-state=${this.appEnv.getCoordinatorBeaconGenesisPath(this.model.network)}`,
      // `--chain-id=${getChainId(this.model.network)}`,
      // `--network-id=${getChainId(this.model.network)}`,
      // '--contract-deployment-block=0',
      // `--deposit-contract=${getValidatorAddress(this.model.network)}`,
      `--enable-upnp`,
      `--p2p-host-ip=${this.ip}`,
      `--p2p-tcp-port=${this.model.coordinatorP2PTcpPort}`,
      `--p2p-udp-port=${this.model.coordinatorP2PUdpPort}`,
      `--grpc-gateway-port=${this.model.coordinatorHttpApiPort}`,
      `--rpc-port=${this.model.coordinatorHttpValidatorApiPort}`,
      `--http-web3provider=${this.appEnv.getValidatorSocket(this.model.id.toString())}`
    ]
    if (this.model.network !== Network.mainnet) {
      args.push(`--bootstrap-node=${getCoordinatorBootnode(this.model.network)}`)
      args.push(`--deposit-contract=${getValidatorAddress(this.model.network)}`)
      args.push(`--min-sync-peers=1`)
    }
    if (this.model.network === Network.testnet9) {
      args.push('--min-sync-peers=1')
    }
    this.coordinatorBeacon = new Child({
      binPath: this.appEnv.getCoordinatorBeaconBinPath(this.model.network),
      args: args,
      logPath: getLogPath(this.model.locationDir),
      logName: 'coordinator-beacon.log'
    })
    this.coordinatorBeacon.on('stop', () => {
      this.emit('stop', 'coordinatorBeacon')
    })
    this.coordinatorBeacon.on('start', () => {
      this.emit('start', 'coordinatorBeacon')
    })

    return true
  }

  private _setValidator(): boolean {
    if (this.model === null || this.validator !== null) {
      return false
    }
    const args = [
      `${getValidatorNetwork(this.model.network)}`,
      `--datadir=${getValidatorPath(this.model.locationDir)}`,
      // `--bootnodes=${getValidatorBootnode(this.model.network)}`,
      // `--networkid=${getChainId(this.model.network)}`,
      '--creator',
      '--nat=any',
      '--syncmode=full',
      `--port=${this.model.validatorP2PPort}`,
      `--ipcpath=${this.appEnv.getValidatorSocket(this.model.id.toString())}`,
      `--password=${getValidatorPasswordPath(this.model.locationDir)}`
    ]
    if (this.model.network !== Network.mainnet) {
      args.push(`--bootnodes=${getValidatorBootnode(this.model.network)}`)
    }
    this.validator = new Child({
      binPath: this.appEnv.getValidatorBinPath(this.model.network),
      args: args,
      logPath: getLogPath(this.model.locationDir),
      logName: 'validator.log'
    })
    this.validator.on('stop', () => {
      this.emit('stop', 'validator')
    })
    this.validator.on('start', () => {
      this.emit('start', 'validator')
    })
    return true
  }

  private _setCoordinatorValidator(): boolean {
    if (this.model === null || this.coordinatorValidator !== null) {
      return false
    }
    this.coordinatorValidator = new Child({
      binPath: this.appEnv.getCoordinatorValidatorBinPath(this.model.network),
      args: [
        '--accept-terms-of-use',
        `${getCoordinatorNetwork(this.model.network)}`,
        '--grpc-max-msg-size=15900000',
        `--beacon-rpc-provider=localhost:${this.model.coordinatorHttpValidatorApiPort}`,
        `--wallet-dir=${getCoordinatorWalletPath(this.model.locationDir)}`,
        `--wallet-password-file=${getCoordinatorWalletPasswordPath(this.model.locationDir)}`
      ],
      logPath: getLogPath(this.model.locationDir),
      logName: 'coordinator-validator.log'
    })
    this.coordinatorValidator.on('stop', () => {
      this.emit('stop', 'coordinatorValidator')
    })
    this.coordinatorValidator.on('start', () => {
      this.emit('start', 'coordinatorValidator')
    })
    return true
  }

  private async _importAccounts(): Promise<number> {
    return await new Promise((resolve) => {
      if (!this.model) {
        return resolve(0)
      }
      execFile(
        this.appEnv.getCoordinatorValidatorBinPath(this.model.network),
        [
          'accounts',
          'import',
          '--accept-terms-of-use',
          `--keys-dir=${getCoordinatorKeysPath(this.model.locationDir)}`,
          `--wallet-dir=${getCoordinatorWalletPath(this.model.locationDir)}`,
          `--wallet-password-file=${getCoordinatorWalletPasswordPath(this.model.locationDir)}`,
          `--account-password-file=${getCoordinatorWalletPasswordPath(this.model.locationDir)}`
        ],
        (err, stdout, stderr) => {
          if (err) {
            return resolve(0)
          }
          if (stdout) {
            const regex = /Successfully imported (\d+) accounts/i
            const matches = stdout
              .trim()
              // eslint-disable-next-line no-control-regex
              .replace(/\u001b\[\d+m/g, '')
              .match(regex)
            if (matches && matches.length > 1) {
              const number = parseInt(matches[1], 10)
              return resolve(number)
            }
            return resolve(0)
          }
          if (stderr) {
            return resolve(0)
          }
        }
      )
    })
  }

  public async getCoordinatorValidatorPassword() {
    if (this.model === null) {
      return null
    }
    const password = crypto.randomBytes(16).toString('hex')
    return await checkOrCreateFile(
      getCoordinatorWalletPasswordPath(this.model.locationDir),
      password
    )
  }

  public async removeData() {
    if (this.model === null) {
      return false
    }
    return await deleteFolderRecursive(this.model.locationDir)
  }

  public async addWorkers(keys: Key[], lastIndex: number) {
    if (this.model === null) {
      return false
    }
    if (keys.length === 0) {
      return false
    }
    for (const key of keys) {
      await checkOrCreateFile(
        getCoordinatorKeyPath(
          this.model.locationDir,
          `keystore-${key.coordinatorKey.path.replaceAll('/', '_')}-${Date.now()}.json`
        ),
        JSON.stringify(key.coordinatorKey)
      )
      await checkOrCreateFile(
        getValidatorKeystorePath(
          this.model.locationDir,
          `UTC--${getCurrentDateUTC(true)}--${key.validatorKey.address}`
        ),
        JSON.stringify(key.validatorKey)
      )
      await appendToFile(
        getValidatorPasswordPath(this.model.locationDir),
        `${key.validatorPassword}\n`
      )
    }
    const importAccounts: number = await this._importAccounts()

    log.debug(`Imported ${importAccounts} accounts keys: ${keys.length} lastIndex: ${lastIndex}`)

    if (!this.coordinatorValidator) {
      this._setCoordinatorValidator()
    }
    if (this.coordinatorValidator) {
      if (this.coordinatorValidator.isRunning()) {
        await this.coordinatorValidator.stop()
      }
      await this.coordinatorValidator.start()
    }

    return true
  }

  public async removeWorkers(keys: PublicKey[], isAll: boolean): Promise<removeWorkersResponse[]> {
    const results = keys.map((key) => ({ id: key.id, status: false }))
    if (this.model === null) {
      log.warn('removeWorkers: model is null')
      return results
    }
    if (
      this.model.coordinatorStatus !== NodeCoordinatorStatus.stopped ||
      this.model.validatorStatus !== NodeValidatorStatus.stopped
    ) {
      log.warn('removeWorkers: node is running')
      return results
    }
    if (keys.length === 0) {
      log.warn('removeWorkers: empty keys')
      return results
    }

    if (isAll) {
      log.debug('removeWorkers', 'isAll', isAll)
      const statusCoordinator = await deleteFolderRecursive(
        getCoordinatorWalletPath(this.model.locationDir)
      )
      log.debug('removeWorkers', 'statusCoordinator', statusCoordinator)
      if (!statusCoordinator) {
        return results
      }

      const importAccounts = await this._importAccounts()
      log.debug('removeWorkers', '_importAccounts', importAccounts)

      const statusValidator = await deleteFolderRecursive(
        getValidatorKeystorePath(this.model.locationDir)
      )
      log.debug('removeWorkers', 'statusValidator', statusValidator)
      if (!statusValidator) {
        return results
      }

      const statusValidatorPassword = await deleteFile(
        getValidatorPasswordPath(this.model.locationDir)
      )
      log.debug('removeWorkers', 'statusValidatorPassword', statusValidatorPassword)
      if (!statusValidatorPassword) {
        return results
      }
      await this._checkMain()
      return results.map((result) => ({ id: result.id, status: true }))
    }

    const statusesCoordinator = await deleteFilesByCoordinatorPublicKeys(
      getCoordinatorKeysPath(this.model.locationDir),
      keys
    )

    const importAccounts = await this._importAccounts()
    log.debug('removeWorkers', '_importAccounts', importAccounts)

    log.debug('removeWorkers', 'statusesCoordinator', statusesCoordinator)
    const deleteValidatorKeys = keys.filter((key) => {
      const response = statusesCoordinator.find((r) => r.id === key.id)
      return response?.status === true
    })
    log.debug('removeWorkers', 'deleteValidatorKeys', deleteValidatorKeys)
    const statusesValidator = await deleteFilesByValidatorPublicKeys(
      getValidatorKeystorePath(this.model.locationDir),
      deleteValidatorKeys,
      getValidatorPasswordPath(this.model.locationDir)
    )
    log.debug('removeWorkers', 'statusesValidator', statusesValidator)
    return results.map((result) => {
      const coordinatorStatus = statusesCoordinator.find((r) => r.id === result.id)
      const validatorStatus = statusesValidator.find((r) => r.id === result.id)

      return {
        ...result,
        status: (coordinatorStatus?.status && validatorStatus?.status) || false
      }
    })
  }
  public async runCoordinatorCommand(command: string) {
    if (!this.model) {
      return {}
    }
    const startedAt = Date.now()
    try {
      const response = await fetch(
        `http://127.0.0.1:${this.model.coordinatorHttpApiPort}${command}`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      if (!response.ok) {
        log.warn('local:runCoordinatorCommand non-ok response', {
          nodeId: this.model.id,
          command,
          status: response.status,
          durationMs: Date.now() - startedAt
        })
        return {}
      }
      log.debug('local:runCoordinatorCommand success', {
        nodeId: this.model.id,
        command,
        durationMs: Date.now() - startedAt
      })
      return await response.json()
    } catch (error) {
      log.error('local:runCoordinatorCommand failed', {
        nodeId: this.model.id,
        command,
        error: getErrorMessage(error),
        durationMs: Date.now() - startedAt
      })
    }
    return {}
  }

  public async runValidatorCommand(command: string, format?: 'json'): Promise<string | object> {
    if (!this.model) {
      return ''
    }
    const startedAt = Date.now()
    const isWorking = await checkSocket(
      `${this.appEnv.getValidatorSocket(this.model.id.toString())}`
    )
    if (!isWorking) {
      log.warn('local:runValidatorCommand validator socket unavailable', {
        nodeId: this.model.id,
        command: truncateValue(command),
        durationMs: Date.now() - startedAt
      })
      return ''
    }
    return new Promise((resolve, reject) => {
      if (!this.model) {
        return reject('')
      }
      const execCommand = format && format === 'json' ? `JSON.stringify(${command})` : command
      execFile(
        this.appEnv.getValidatorBinPath(this.model.network),
        [
          '--verbosity',
          '0',
          '--exec',
          execCommand,
          'attach',
          this.appEnv.getValidatorSocket(this.model.id.toString())
        ],
        (err, stdout, stderr) => {
          if (err) {
            log.error('local:runValidatorCommand process failed', {
              nodeId: this.model?.id,
              command: truncateValue(command),
              format: format || 'plain',
              error: getErrorMessage(err),
              durationMs: Date.now() - startedAt
            })
            return reject(err)
          }
          if (stdout) {
            if (stdout.search('Error') !== -1) {
              log.warn('local:runValidatorCommand returned error output', {
                nodeId: this.model?.id,
                command: truncateValue(command),
                format: format || 'plain',
                output: truncateValue(stdout),
                durationMs: Date.now() - startedAt
              })
              return reject(stdout)
            }
            if (format && format === 'json') {
              let json = ''
              try {
                json = JSON.parse(stdout)
                json = JSON.parse(json)
              } catch (err) {
                log.error('local:runValidatorCommand json parse failed', {
                  nodeId: this.model?.id,
                  command: truncateValue(command),
                  error: getErrorMessage(err),
                  durationMs: Date.now() - startedAt
                })
                return reject(err)
              }
              log.debug('local:runValidatorCommand success', {
                nodeId: this.model?.id,
                command: truncateValue(command),
                format: 'json',
                durationMs: Date.now() - startedAt
              })
              return resolve(json)
            }
            log.debug('local:runValidatorCommand success', {
              nodeId: this.model?.id,
              command: truncateValue(command),
              format: 'plain',
              durationMs: Date.now() - startedAt
            })
            return resolve(stdout.replaceAll('\n', '').replaceAll('"', '').trim())
          }
          if (stderr) {
            log.error('local:runValidatorCommand stderr', {
              nodeId: this.model?.id,
              command: truncateValue(command),
              format: format || 'plain',
              stderr: truncateValue(stderr),
              durationMs: Date.now() - startedAt
            })
            return reject(stderr)
          }
        }
      )
    })
  }
  public async downloadSnapshot() {
    if (!this.model) {
      return
    }
    if (!this.model.downloadUrl || !this.model.downloadHash) {
      return
    }

    await checkOrCreateDir(this.model.locationDir)
    if (!this.download) {
      this.download = new DownloadFile(
        this.model.downloadUrl,
        getSnapshotPath(this.model.locationDir),
        getLocationPath(this.model.locationDir),
        this.model.downloadHash
      )
      this.download.on('finishDownload', () => {
        this.emit('finishDownload')
      })
      this.download.on('progressDownload', (bytes: number) => {
        this.emit('progressDownload', bytes)
      })
      this.download.on('error', (error: Error) => {
        this.emit('error', error)
        // if (this.download) {
        //   this.download.removeAllListeners()
        //   this.download = null
        // }
      })
      this.download.on('finishVerified', (result: boolean) => {
        this.emit('finishVerified', result)
      })
      this.download.on('finishExtracted', () => {
        this.emit('finishExtracted')
      })

      this.download.on('stopped', (error: Error) => {
        this.emit('stopped', error)
        // if (this.download) {
        //   this.download.removeAllListeners()
        //   this.download = null
        // }
      })
    }
    if (DownloadStatus.downloading === this.model.downloadStatus) {
      await this.download.download()
    } else if (DownloadStatus.verifying === this.model.downloadStatus) {
      this.download.verifyFileIntegrity()
    } else if (DownloadStatus.extracting === this.model.downloadStatus) {
      await this.download.extractAndDeleteTar()
    }
  }
  public stopDownload() {
    if (this.download) {
      this.download.stop()
    }
  }

  private _startMonitoring() {
    if (this.monitoringInterval) {
      return
    }
    this.startTime = new Date()
    this.monitoringInterval = setInterval(this._monitoring.bind(this), 4000)
  }
  private _stopMonitoring() {
    this.startTime = null
    if (!this.monitoringInterval) {
      return
    }
    clearInterval(this.monitoringInterval)
    this.monitoringInterval = null
  }
  private async _monitoring() {
    log.debug('_monitoring start')
    if (this.model === null) {
      return
    }
    if (this.monitoringWorking) return
    this.monitoringWorking = true
    log.debug('monitoringWorking', this.monitoringWorking)
    let ip = ''
    try {
      ip = await getPublicIP()
    } catch (e) {
      log.debug('_monitoring', e)
    }

    try {
      const now = new Date()
      const time = getCurrentDateUTC()

      const [peers, sync] = await Promise.all([this.getPeers(), this.getSync()])

      this.monitoringLogStream?.write(
        `${time} ver=${this.appEnv.version} node_id=${this.model.id.toString()} c_peers=${peers?.coordinatorPeersCount} v_peers=${peers?.validatorPeersCount} c_distance=${sync?.coordinatorSyncDistance} c_head=${sync?.coordinatorHeadSlot} c_previous_justified=${sync?.coordinatorPreviousJustifiedEpoch} c_current_justified=${sync?.coordinatorCurrentJustifiedEpoch} c_finalized=${sync?.coordinatorFinalizedEpoch} v_distance=${sync?.validatorSyncDistance} v_head=${sync?.validatorHeadSlot} v_finalized=${sync?.validatorFinalizedSlot} ip=${ip} \n`
      )
      if (ip && ip !== this.ip) {
        this.monitoringLogStream?.write(
          `${time} ver=${this.appEnv.version} node_id=${this.model.id.toString()} new=${ip} old=${this.ip} restart change ip\n`
        )
        await this.restart()
        this.ip = ip
        this.monitoringWorking = false
      } else {
        const tenMinutesAgo = new Date(now.getTime() - 600000)
        if (
          this.startTime &&
          this.startTime < tenMinutesAgo &&
          peers &&
          (peers.coordinatorPeersCount === 0 || peers.validatorPeersCount === 0)
        ) {
          this.monitoringLogStream?.write(
            `${time} ver=${this.appEnv.version} node_id=${this.model.id.toString()} c_peers=${peers?.coordinatorPeersCount} v_peers=${peers?.validatorPeersCount} restart none peers\n`
          )
          await this.restart()
        }
      }
    } catch (e) {
      log.error('_monitoring', e)
    }
    this.monitoringWorking = false
    log.debug('monitoringWorking', this.monitoringWorking)
  }
}

export default LocalNode
