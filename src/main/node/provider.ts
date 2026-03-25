/*
 * Copyright 2026   Digital Clever Solution Inc.
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
import log from 'electron-log/node'

import AppEnv from '../libs/appEnv'

import { Node } from '../models/node'
import { EventEmitter } from 'node:events'
import { ValidatorStatus, Worker as WorkerModelType, WorkerStatus } from '../models/worker'
import Web3 from 'web3'
import { isSyncInfo, isWatInfo } from '../helpers/node'
import { EraInfo, isEraInfo, isValidatorInfo } from '../helpers/worker'
import { PublicKey } from '../worker'
import { getRPC, Network } from '../libs/env'

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error)

export enum StatusResult {
  success = 'success',
  fail = 'fail'
}

export type StatusResults = {
  coordinatorBeacon: StatusResult
  coordinatorValidator: StatusResult
  validator: StatusResult
}

export type removeWorkersResponse = {
  id: number | bigint
  status: boolean
}

class ProviderNode extends EventEmitter {
  private readonly appEnv: AppEnv
  private readonly model: Node | null

  constructor(model: Node | undefined, appEnv: AppEnv) {
    super()
    this.appEnv = appEnv
    this.model = model || null
  }

  public async initialize(): Promise<StatusResults> {
    if (this.model === null) {
      return {
        coordinatorBeacon: StatusResult.fail,
        validator: StatusResult.fail,
        coordinatorValidator: StatusResult.fail
      }
    }
    log.debug('initialize', this.appEnv.version)
    return {
      coordinatorBeacon: StatusResult.success,
      validator: StatusResult.success,
      coordinatorValidator: StatusResult.success
    }
  }

  public async start(): Promise<StatusResults> {
    const results: StatusResults = {
      coordinatorBeacon: StatusResult.success,
      validator: StatusResult.success,
      coordinatorValidator: StatusResult.success
    }
    this.emit('start', 'provider')
    return results
  }

  public async stop(): Promise<StatusResults> {
    const results: StatusResults = {
      coordinatorBeacon: StatusResult.success,
      validator: StatusResult.success,
      coordinatorValidator: StatusResult.success
    }
    this.emit('stop', 'provider')
    return results
  }

  public async restart(): Promise<StatusResults> {
    const results: StatusResults = {
      coordinatorBeacon: StatusResult.success,
      validator: StatusResult.success,
      coordinatorValidator: StatusResult.success
    }
    return results
  }

  public getPids() {
    return {
      coordinatorBeacon: undefined,
      validator: undefined,
      coordinatorValidator: undefined
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
      const response = await this.runValidatorCommand('eth_syncing')
      if (isSyncInfo(response)) {
        const currentSlot = response.currentSlot
        const finalizedSlot = response.finalizedSlot
        results.validatorHeadSlot = BigInt(finalizedSlot)
        results.validatorSyncDistance = BigInt(currentSlot) - BigInt(finalizedSlot)
        results.validatorFinalizedSlot = BigInt(finalizedSlot)
      } else {
        const response = await this.runValidatorCommand('wat_info')

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
    const results: WorkerStatus[] = workers.map((worker) => ({
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
    }))
    if (this.model === null) {
      return results
    }

    const batchSize = this.model.network === Network.mainnet ? 50 : 1
    try {
      for (let i = 0; i < workers.length; i += batchSize) {
        const batch = workers.slice(i, i + batchSize)
        const queryString = batch
          .map(
            (worker) =>
              `id=${worker.validatorIndex ? worker.validatorIndex : '0x' + worker.coordinatorPublicKey}`
          )
          .join('&')
        const coordinatorResponse = await this.runCoordinatorCommand(
          `/eth/v1/beacon/states/head/validators?${queryString}`
        )
        if (coordinatorResponse?.data) {
          coordinatorResponse.data.forEach((coordinator) => {
            const resultIndex = results.findIndex(
              (worker) =>
                `0x${worker.coordinatorPublicKey.toLowerCase()}` ===
                coordinator.validator.pubkey.toLowerCase()
            )
            results[resultIndex].coordinatorStatus = coordinator.status
            results[resultIndex].coordinatorBalanceAmount = Web3.utils.fromWei(
              Web3.utils.toWei(coordinator.balance, 'gwei'),
              'ether'
            )
            if (coordinator.validator.activation_epoch !== '18446744073709551615') {
              results[resultIndex].coordinatorActivationEpoch =
                coordinator.validator.activation_epoch
            }
            if (coordinator.validator.exit_epoch !== '18446744073709551615') {
              results[resultIndex].coordinatorDeActivationEpoch = coordinator.validator.exit_epoch
            }
            results[resultIndex].stakeAmount = Web3.utils.fromWei(
              Web3.utils.toWei(coordinator.validator.effective_balance, 'gwei'),
              'ether'
            )
            results[resultIndex].validatorIndex = parseInt(coordinator.index)
          })
        }
      }
    } catch (e) {
      log.error(e)
    }

    const currentEra = await this.runValidatorCommand('wat_getEra')
    try {
      for (let i = 0; i < workers.length; i += batchSize) {
        const batch = workers.slice(i, i + batchSize)
        const [validatorResponses, validatorsBalanceAmount] = await Promise.all([
          this.runValidatorCommands(
            batch.map((worker) => ({
              method: `wat_validator_GetInfo`,
              params: [`0x${worker.validatorAddress}`, 'latest']
            }))
          ).catch(() => null),
          this.runValidatorCommands(
            batch.map((worker) => ({
              method: `eth_getBalance`,
              params: [`0x${worker.validatorAddress}`, 'latest']
            }))
          ).catch(() => null)
        ])
        if (validatorResponses) {
          const eraNumbers: number[] = []
          validatorResponses.forEach((validator) => {
            if (isValidatorInfo(validator)) {
              if (
                validator.activationEra !== 18446744073709552000 &&
                !eraNumbers.includes(validator.activationEra)
              ) {
                eraNumbers.push(validator.activationEra)
              }
              if (
                validator.exitEra !== 18446744073709552000 &&
                !eraNumbers.includes(validator.exitEra)
              ) {
                eraNumbers.push(validator.exitEra)
              }
            }
          })
          const eras = await this.runValidatorCommands(
            eraNumbers.map((num) => ({
              method: `wat_getEra`,
              params: [num]
            }))
          ).catch(() => null)
          for (let index = 0; index < batch.length; index++) {
            const validatorResponse = validatorResponses[index]
            const resultIndex = i + index

            try {
              const validatorBalanceAmount = validatorsBalanceAmount
                ? validatorsBalanceAmount[index]
                : null

              if (isValidatorInfo(validatorResponse)) {
                const activationEra = eras?.find(
                  (era) => isEraInfo(era) && era.number === validatorResponse.activationEra
                )
                const exitEra = eras?.find(
                  (era) => isEraInfo(era) && era.number === validatorResponse.exitEra
                )
                results[resultIndex].validatorStatus = ValidatorStatus.pending_initialized
                if (isEraInfo(currentEra)) {
                  if (validatorResponse.activationEra !== 18446744073709552000) {
                    results[resultIndex].validatorStatus =
                      validatorResponse.activationEra <= currentEra.number
                        ? ValidatorStatus.active
                        : ValidatorStatus.pending_activation
                  }
                  if (isEraInfo(activationEra)) {
                    results[resultIndex].validatorActivationEpoch =
                      activationEra.fromEpoch.toString()
                  } else if (validatorResponse.activationEra === currentEra.number + 1) {
                    results[resultIndex].validatorActivationEpoch = (
                      currentEra.toEpoch + 1
                    ).toString()
                  }
                  if (validatorResponse.exitEra !== 18446744073709552000) {
                    results[resultIndex].validatorStatus =
                      validatorResponse.exitEra <= currentEra.number
                        ? ValidatorStatus.exited
                        : ValidatorStatus.pending_exiting
                  }
                  if (isEraInfo(exitEra)) {
                    results[resultIndex].validatorDeActivationEpoch = exitEra.fromEpoch.toString()
                  } else if (validatorResponse.exitEra === currentEra.number + 1) {
                    results[resultIndex].validatorDeActivationEpoch = (
                      currentEra.toEpoch + 1
                    ).toString()
                  }
                }
              }
              if (validatorBalanceAmount && typeof validatorBalanceAmount === 'string') {
                results[resultIndex].validatorBalanceAmount = Web3.utils.fromWei(
                  validatorBalanceAmount,
                  'ether'
                )
              }
            } catch (e) {
              log.error(e)
            }
          }
        }
      }
    } catch (e) {
      log.error(e)
    }

    return results
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
        this.runValidatorCommand(`wat_validator_GetInfo`, [
          `0x${worker.validatorAddress}`,
          'latest'
        ]).catch(() => null),
        this.runValidatorCommand('wat_getEra'),
        this.runValidatorCommand(`eth_getBalance`, [`0x${worker.validatorAddress}`, 'latest'])
      ])
      if (isValidatorInfo(validatorResponse)) {
        let activationEra: null | EraInfo = null
        let exitEra: null | EraInfo = null
        try {
          activationEra =
            validatorResponse.activationEra === 18446744073709552000
              ? null
              : ((await this.runValidatorCommand(`wat_getEra`, [
                  validatorResponse.activationEra
                ])) as EraInfo)
        } catch (e) {
          log.error(e)
        }
        try {
          exitEra =
            validatorResponse.exitEra === 18446744073709552000
              ? null
              : ((await this.runValidatorCommand(`wat_getEra`, [
                  validatorResponse.exitEra
                ])) as EraInfo)
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
  public async removeData() {
    if (this.model === null) {
      return false
    }
    return true
  }
  public async runCoordinatorCommand(command: string) {
    if (!this.model) {
      return {}
    }
    const startedAt = Date.now()
    const network = this.model.network
    try {
      const response = await fetch(
        `${getRPC(this.model ? this.model.network : Network.mainnet)}/coordinator/${command}`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      if (!response.ok) {
        log.warn('provider:runCoordinatorCommand non-ok response', {
          network,
          command,
          status: response.status,
          durationMs: Date.now() - startedAt
        })
        return {}
      }
      log.debug('provider:runCoordinatorCommand success', {
        network,
        command,
        durationMs: Date.now() - startedAt
      })
      return await response.json()
    } catch (error) {
      log.error('provider:runCoordinatorCommand failed', {
        network,
        command,
        error: getErrorMessage(error),
        durationMs: Date.now() - startedAt
      })
    }
    return {}
  }

  public async runValidatorCommands(
    req: ValidatorCommandReq[]
  ): Promise<string[] | boolean[] | object[]> {
    if (!this.model) {
      return []
    }
    if (!Array.isArray(req) || req.length === 0) {
      return []
    }
    const startedAt = Date.now()
    const network = this.model.network
    const methods = req.map((item) => item.method)
    try {
      const response = await fetch(getRPC(this.model ? this.model.network : Network.mainnet), {
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(
          req.map(({ method, params }, id) => ({
            jsonrpc: '2.0',
            method,
            params: params || [],
            id
          }))
        ),
        method: 'POST'
      })
      if (!response.ok) {
        log.warn('provider:runValidatorCommands non-ok response', {
          network,
          batchSize: req.length,
          methods,
          status: response.status,
          durationMs: Date.now() - startedAt
        })
        return []
      }
      const result = await response.json()
      if (!Array.isArray(result)) {
        log.error('provider:runValidatorCommands invalid batch response', {
          network,
          batchSize: req.length,
          methods,
          responseType: typeof result,
          durationMs: Date.now() - startedAt
        })
        return []
      }
      log.debug('provider:runValidatorCommands success', {
        network,
        batchSize: req.length,
        methods,
        durationMs: Date.now() - startedAt
      })
      return result.map((r) => r.result)
    } catch (error) {
      log.error('provider:runValidatorCommands failed', {
        network,
        batchSize: req.length,
        methods,
        error: getErrorMessage(error),
        durationMs: Date.now() - startedAt
      })
    }
    return []
  }

  public async runValidatorCommand(
    method: string,
    params: (string | number | bigint | boolean)[] = []
  ): Promise<string | boolean | object> {
    if (!this.model) {
      return {}
    }
    const startedAt = Date.now()
    const network = this.model.network
    try {
      const response = await fetch(getRPC(this.model ? this.model.network : Network.mainnet), {
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method,
          params,
          id: 1
        }),
        method: 'POST'
      })
      if (!response.ok) {
        log.warn('provider:runValidatorCommand non-ok response', {
          network,
          method,
          paramsCount: params.length,
          status: response.status,
          durationMs: Date.now() - startedAt
        })
        return {}
      }
      const result = await response.json()
      log.debug('provider:runValidatorCommand success', {
        network,
        method,
        paramsCount: params.length,
        durationMs: Date.now() - startedAt
      })
      return result.result
    } catch (error) {
      log.error('provider:runValidatorCommand failed', {
        network,
        method,
        paramsCount: params.length,
        error: getErrorMessage(error),
        durationMs: Date.now() - startedAt
      })
    }
    return {}
  }
  public async removeWorkers(keys: PublicKey[]): Promise<removeWorkersResponse[]> {
    return keys.map((key) => ({ id: key.id, status: true }))
  }
}

type ValidatorCommandReq = {
  method: string
  params: Array<string | number | bigint | boolean>
}
export default ProviderNode
