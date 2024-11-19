/*
 * Copyright 2024   Blue Wave Inc.
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
import { IpcMain, IpcMainInvokeEvent } from 'electron'
import log from 'electron-log/node'
import AppEnv from '../libs/appEnv'
import NodeModel, { CoordinatorStatus, Type as NodeType, ValidatorStatus } from '../models/node'
import WorkerModel, {
  NewWorker as NewWorkerModelType,
  Worker as WorkerModelType
} from '../models/worker'
import { getMain } from '../libs/db'
import Web3 from 'web3'
import {
  GetCoordinatorKeyStoreResponseType,
  GetDepositDataResponse,
  GetValidatorKeyStoreResponseType
} from 'web3/utils'
import LocalNode from '../node/local'
import ProviderNode from '../node/provider'
import crypto from 'crypto'
import { getRPC, getStakeAmount } from '../libs/env'
import { readJSON } from '../libs/fs'
import { validateDelegateRules, validateDepositData } from '../helpers/worker'
import { getWeb3 } from '../libs/web3'
import { TransactionConfig } from 'web3-core'

enum ErrorResults {
  NODE_NOT_FOUND = 'Node is Not Found',
  MNEMONIC_NOT_PROVIDED = 'Mnemonic is not provided',
  MNEMONIC_NOT_MATCHED = 'Mnemonic is not matched',
  MNEMONIC_INVALID = 'Invalid mnemonic',
  AMOUNT_NOT_PROVIDED = 'Amount is not provided',
  WITHDRAWAL_NOT_PROVIDED = 'Withdrawal Address is not provided',
  WORKER_NOT_FOUND = 'Worker Is Not Found',
  ACTION_NOT_FOUND = 'Action is not provided',
  PASSWORD_NOT_GENERATE = 'Password was not generated',
  ADD_WORKER_FAILED = 'Add Worker Failed',
  DELEGATE_RULES_INVALID = 'Delegate rules invalid',
  DEPOSIT_DATA_INVALID = 'Deposit data invalid'
}

export interface Response<T> {
  status: 'error' | 'success'
  message?: ErrorResults
  data?: T
}

export interface Key {
  depositData: GetDepositDataResponse
  coordinatorKey: GetCoordinatorKeyStoreResponseType
  validatorKey: GetValidatorKeyStoreResponseType
  coordinatorPassword: string
  validatorPassword: string
}

export interface PublicKey {
  id: number | bigint
  coordinatorPublicKey: string
  validatorAddress: string
}

export interface addParams {
  nodeId: number | bigint
  mnemonic?: string
  amount?: number
  withdrawalAddress?: string
  depositData?: string
  delegateRules?: string
}

export enum ActionTxType {
  activate = 'activate',
  deActivate = 'deActivate',
  withdraw = 'withdraw'
}

export interface ActionTx {
  from: string
  to: string
  value: number | bigint
  hexData: string
}

class Worker {
  private ipcMain: IpcMain
  private appEnv: AppEnv
  private nodeModel: NodeModel
  private workerModel: WorkerModel

  constructor(ipcMain: IpcMain, appEnv: AppEnv) {
    this.ipcMain = ipcMain
    this.appEnv = appEnv
    this.nodeModel = new NodeModel(getMain(this.appEnv.mainDB))
    this.workerModel = new WorkerModel(getMain(this.appEnv.mainDB))
  }

  public async initialize(): Promise<boolean> {
    this.ipcMain.handle('worker:genMnemonic', () => this._genMnemonic())
    this.ipcMain.handle('worker:add', (_event: IpcMainInvokeEvent, data) => this._add(data))
    this.ipcMain.handle('worker:delete', (_event: IpcMainInvokeEvent, ids) => this._delete(ids))
    this.ipcMain.handle('worker:getAll', () => this.workerModel.getAll({ withNode: true }))
    this.ipcMain.handle('worker:getById', (_event: IpcMainInvokeEvent, id) =>
      this.workerModel.getById(id, { withNode: true })
    )
    this.ipcMain.handle('worker:getAllByNodeId', (_event: IpcMainInvokeEvent, id) =>
      this.workerModel.getByNodeId(id, { withNode: true })
    )
    this.ipcMain.handle('worker:getActionTx', (_event: IpcMainInvokeEvent, action, id, amount) =>
      this._getActionTx(action, id, amount)
    )
    this.ipcMain.handle('worker:getDepositDataCount', (_event: IpcMainInvokeEvent, path) =>
      this._getDepositDataCount(path)
    )
    this.ipcMain.handle('worker:getDelegateRules', (_event: IpcMainInvokeEvent, path) =>
      this._getDelegateRules(path)
    )
    this.ipcMain.handle('worker:sendActionTx', (_event: IpcMainInvokeEvent, action, ids, pk) =>
      this._sendActionTx(action, ids, pk)
    )
    this.ipcMain.handle('worker:getBalance', (_event: IpcMainInvokeEvent, nodeId, address) =>
      this._getBalance(nodeId, address)
    )

    return true
  }

  public async destroy() {
    this.ipcMain.removeHandler('worker:genMnemonic')
    this.ipcMain.removeHandler('worker:add')
    this.ipcMain.removeHandler('worker:delete')
    this.ipcMain.removeHandler('worker:getAll')
    this.ipcMain.removeHandler('worker:getById')
    this.ipcMain.removeHandler('worker:getAllByNodeId')
    this.ipcMain.removeHandler('worker:getActionTx')
    this.ipcMain.removeHandler('worker:getDepositDataCount')
    this.ipcMain.removeHandler('worker:getDelegateRules')
    this.ipcMain.removeHandler('worker:sendActionTx')
    this.ipcMain.removeHandler('worker:getBalance')
  }

  private _genMnemonic() {
    return Web3.utils.genMnemonic()
  }

  private async _add(data: addParams): Promise<Response<WorkerModelType[]>> {
    if (!data.nodeId) {
      return {
        status: 'error',
        message: ErrorResults.NODE_NOT_FOUND
      }
    }

    log.debug(data)
    if (data.depositData && data.delegateRules) {
      return this._addDelegate(data.nodeId, data.depositData, data.delegateRules)
    }
    if (!data.mnemonic) {
      return {
        status: 'error',
        message: ErrorResults.MNEMONIC_NOT_PROVIDED
      }
    }
    const memoHash = Web3.utils.sha3(data.mnemonic)
    if (!memoHash) {
      return { status: 'error', message: ErrorResults.MNEMONIC_NOT_PROVIDED }
    }
    if (!data.amount) {
      return { status: 'error', message: ErrorResults.AMOUNT_NOT_PROVIDED }
    }
    if (!data.withdrawalAddress) {
      return { status: 'error', message: ErrorResults.WITHDRAWAL_NOT_PROVIDED }
    }
    const nodeModel = this.nodeModel.getById(data.nodeId)
    if (!nodeModel) {
      return { status: 'error', message: ErrorResults.NODE_NOT_FOUND }
    }
    if (nodeModel.memoHash && nodeModel.memoHash !== memoHash) {
      return { status: 'error', message: ErrorResults.MNEMONIC_NOT_MATCHED }
    }

    const node = new LocalNode(nodeModel, this.appEnv)

    const coordinatorPassword = await node.getCoordinatorValidatorPassword()
    if (!coordinatorPassword) {
      return { status: 'error', message: ErrorResults.PASSWORD_NOT_GENERATE }
    }

    log.debug('workersCount', nodeModel.workersCount)
    const firstIndex = nodeModel.workersCount ? nodeModel.workersCount : 0
    const lastIndex = nodeModel.workersCount ? nodeModel.workersCount + data.amount : data.amount
    const keys: Key[] = []
    const newWorkers: NewWorkerModelType[] = []
    for (let index = firstIndex; index < lastIndex; index++) {
      try {
        const validatorPassword = crypto.randomBytes(16).toString('hex')
        const key = {
          depositData: await Web3.utils.getDepositData(
            data.mnemonic,
            index,
            data.withdrawalAddress
          ),
          coordinatorKey: await Web3.utils.getCoordinatorKeyStore(
            data.mnemonic,
            index,
            coordinatorPassword
          ),
          validatorKey: await Web3.utils.getValidatorKeyStore(
            data.mnemonic,
            index,
            validatorPassword
          ),
          validatorPassword,
          coordinatorPassword
        }
        const worker: NewWorkerModelType = {
          nodeId: data.nodeId,
          coordinatorPublicKey: key.depositData.pubkey,
          validatorAddress: key.depositData.creator_address,
          withdrawalAddress: key.depositData.withdrawal_address,
          signature: key.depositData.signature,
          delegate: null
        }
        keys.push(key)
        newWorkers.push(worker)
      } catch (error) {
        log.error(error)
        if (error instanceof Error && error.message.includes('invalid mnemonic')) {
          return { status: 'error', message: ErrorResults.MNEMONIC_INVALID }
        }
        return { status: 'error', message: ErrorResults.ADD_WORKER_FAILED }
      }
    }

    if (memoHash && !nodeModel.memoHash) {
      nodeModel.memoHash = memoHash
    }
    const workers = this.workerModel.insert(newWorkers, nodeModel)

    await node.addWorkers(keys, lastIndex)

    return { status: 'success', data: workers }
  }

  private async _addDelegate(
    nodeId: number | bigint,
    depositDataFile: string,
    delegateRulesFile: string
  ): Promise<Response<WorkerModelType[]>> {
    log.debug(depositDataFile, delegateRulesFile)

    const nodeModel = this.nodeModel.getById(nodeId)
    if (!nodeModel) {
      return { status: 'error', message: ErrorResults.NODE_NOT_FOUND }
    }
    try {
      const depositData = await readJSON(depositDataFile)
      const jsonDepositData = JSON.parse(depositData)

      if (!validateDepositData(jsonDepositData)) {
        return {
          status: 'error',
          message: ErrorResults.DEPOSIT_DATA_INVALID
        }
      }

      const delegateRules = await readJSON(delegateRulesFile)
      const jsondelegateRules = JSON.parse(delegateRules)

      if (!validateDelegateRules(jsondelegateRules)) {
        return {
          status: 'error',
          message: ErrorResults.DELEGATE_RULES_INVALID
        }
      }
      const newWorkers = jsonDepositData
        .filter((data) => !this.workerModel.getByPk(data.pubkey))
        .map((data) => ({
          nodeId: nodeId,
          coordinatorPublicKey: data.pubkey,
          validatorAddress: data.creator_address,
          withdrawalAddress: data.withdrawal_address,
          signature: data.signature,
          delegate: delegateRules
        }))
      const workers = this.workerModel.insert(newWorkers, nodeModel)
      return { status: 'success', data: workers }
    } catch (err) {
      return { status: 'error', data: [], message: ErrorResults.ADD_WORKER_FAILED }
    }
  }

  private async _delete(ids: number[] | bigint[]): Promise<boolean[] | ErrorResults> {
    log.debug('_delete', ids)
    if (!ids || ids.length == 0) {
      return ErrorResults.WORKER_NOT_FOUND
    }
    const results = ids.map(() => false)

    const nodes = {}

    for (const id of ids) {
      const worker = this.workerModel.getById(id)
      if (!worker) {
        return ErrorResults.WORKER_NOT_FOUND
      }
      if (!nodes[worker.nodeId.toString()]) {
        nodes[worker.nodeId.toString()] = []
      }
      nodes[worker.nodeId.toString()].push(worker)
    }

    for (const nodeId in nodes) {
      const nodeWorker = nodes[nodeId]
      const nodeModel = this.nodeModel.getById(parseInt(nodeId))
      if (
        !nodeModel ||
        (nodeModel.type === NodeType.local &&
          (nodeModel.coordinatorStatus !== CoordinatorStatus.stopped ||
            nodeModel.validatorStatus !== ValidatorStatus.stopped))
      ) {
        continue
      }
      const node =
        nodeModel.type === NodeType.local
          ? new LocalNode(nodeModel, this.appEnv)
          : new ProviderNode(nodeModel, this.appEnv)

      const countByNode = this.workerModel.getCount({ nodeId: parseInt(nodeId) })

      const keys = nodeWorker.map((worker) => ({
        id: worker.id,
        coordinatorPublicKey: worker.coordinatorPublicKey,
        validatorAddress: worker.validatorAddress
      }))

      const isAll = countByNode === nodeWorker.length
      log.debug('countByNode', isAll, countByNode, nodeWorker.length)
      const statuses = await node.removeWorkers(keys, isAll)
      log.debug('removeWorkers', statuses)
      if (isAll) {
        this.nodeModel.update(nodeModel.id, { memoHash: '', workersCount: 0 })
      }

      for (const workerStatus of statuses) {
        if (!workerStatus.status) {
          continue
        }
        const status = this.workerModel.remove(workerStatus.id)
        if (status) {
          const index = ids.findIndex((id) => id === workerStatus.id)
          results[index] = true
        }
      }
    }
    return results
  }

  private async _sendActionTx(
    action: ActionTxType,
    ids: number[] | bigint[],
    pk: string
  ): Promise<boolean[] | ErrorResults> {
    log.debug('_sendActionTx', action, ids)
    if (!action) {
      return ErrorResults.ACTION_NOT_FOUND
    }
    if (!ids || ids.length == 0 || !pk) {
      return ErrorResults.WORKER_NOT_FOUND
    }
    const results = ids.map(() => false)

    for (const id of ids) {
      const worker = this.workerModel.getById(id, { withNode: true })
      if (!worker || !worker.node) {
        log.error('no worker', worker)
        continue
      }
      log.debug(id)
      try {
        const web3 = getWeb3(getRPC(worker.node.network))
        if (!web3 || !web3.currentProvider) {
          log.error('no web3 currentProvider')
          continue
        }
        const depositAddress = await web3.wat.validator.depositAddress()
        const account = web3.eth.accounts.privateKeyToAccount(pk)

        let data, value
        if (action === ActionTxType.activate) {
          value = web3.utils.toWei(getStakeAmount(worker.node.network).toString(), 'ether')
          log.debug('value', value)
          const depositData: DepositDataType = {
            pubkey: worker.coordinatorPublicKey,
            creator_address: worker.validatorAddress,
            withdrawal_address: worker.withdrawalAddress,
            signature: worker.signature
          }
          log.debug('depositData1', depositData)
          if (worker.delegate) {
            try {
              depositData.delegating_stake = worker.delegate as unknown as DelegatingStakeType
              if (!depositData.delegating_stake.trial_period) {
                depositData.delegating_stake.trial_period = '0x0'
              }
              if (!depositData.delegating_stake.trial_rules) {
                depositData.delegating_stake.trial_rules = depositData.delegating_stake.rules
              }
            } catch (e) {
              log.error('depositData error', e)
              continue
            }
          }
          log.debug('depositData2', depositData)
          data = await web3.wat.validator.depositData(depositData)
          log.debug('depositData2', data)
        } else if (action === ActionTxType.deActivate) {
          value = 0
          data = await web3.wat.validator.exitData({
            pubkey: worker.coordinatorPublicKey,
            creator_address: worker.validatorAddress
          })
        } else if (action === ActionTxType.withdraw) {
          value = 0
          data = await web3.wat.validator.withdrawalData({
            creator_address: `0x${worker.validatorAddress}`,
            amount: '0'
          })
        }
        const nonce = await web3.eth.getTransactionCount(account.address, 'pending')
        log.debug('nonce', nonce)
        const tx: TransactionConfig = {
          from: account.address,
          to: depositAddress,
          value,
          data,
          nonce
        }
        tx.gas = await web3.eth.estimateGas(tx)
        const signedTx = await web3.eth.accounts.signTransaction(tx, pk)
        log.debug(tx)
        if (!signedTx?.rawTransaction) {
          log.error('no signedTx', signedTx)
          continue
        }
        const sendTransaction = (rawTransaction: string) => {
          log.debug(rawTransaction)
          return new Promise((resolve, reject) => {
            if (!web3.currentProvider) {
              log.error('No web3 provider')
              reject('No web3 provider')
              return
            }
            const provider: any = web3.currentProvider
            if (typeof provider.send === 'function') {
              provider.send(
                {
                  jsonrpc: '2.0',
                  method: 'eth_sendRawTransaction',
                  params: [rawTransaction],
                  id: Date.now()
                },
                (error: any, result: any) => {
                  if (error) {
                    log.error('send eth_sendRawTransaction', error)
                    reject(error)
                  } else {
                    log.debug('send', result)
                    if (result.error) {
                      return reject(result.error)
                    }
                    resolve(result.result)
                  }
                }
              )
            } else if (typeof provider.sendAsync === 'function') {
              provider.sendAsync(
                {
                  jsonrpc: '2.0',
                  method: 'eth_sendRawTransaction',
                  params: [rawTransaction],
                  id: Date.now()
                },
                (error: any, result: any) => {
                  if (error) {
                    log.error('sendAsync eth_sendRawTransaction', error)
                    reject(error)
                  } else {
                    log.debug('sendAsync', result)
                    if (result.error) {
                      return reject(result.error)
                    }
                    resolve(result.result)
                  }
                }
              )
            } else {
              reject(new Error('Unsupported provider'))
            }
          })
        }
        const hash = await sendTransaction(signedTx.rawTransaction)
        log.debug('tx-hash', hash)
      } catch (e) {
        log.error(e)
        continue
      }
      const index = ids.findIndex((id) => id === worker.id)
      results[index] = true
    }

    log.debug(results)
    return results
  }

  private async _getActionTx(
    action: ActionTxType,
    id: number,
    amount?: string
  ): Promise<ActionTx | ErrorResults> {
    if (!action) {
      return ErrorResults.ACTION_NOT_FOUND
    }
    const worker = this.workerModel.getById(id, { withNode: true })
    if (!worker) {
      return ErrorResults.WORKER_NOT_FOUND
    }
    if (!worker.node) {
      return ErrorResults.NODE_NOT_FOUND
    }

    const web3 = getWeb3(getRPC(worker.node.network))
    if (!web3 || !web3.currentProvider) {
      log.error('no web3 currentProvider')
      return ErrorResults.NODE_NOT_FOUND
    }
    let delegating_stake
    if (worker.delegate) {
      try {
        delegating_stake = worker.delegate as unknown as DelegatingStakeType
        if (!delegating_stake.trial_period) {
          delegating_stake.trial_period = '0x0'
        }
        if (!delegating_stake.trial_rules) {
          delegating_stake.trial_rules = delegating_stake.rules
        }
      } catch (e) {
        log.error('depositData error', e)
        return ErrorResults.DELEGATE_RULES_INVALID
      }
    }

    let hexData, value
    let from = `0x${worker.withdrawalAddress}`
    if (action === ActionTxType.activate) {
      value = getStakeAmount(worker.node.network)
      const depositData: DepositDataType = {
        pubkey: worker.coordinatorPublicKey,
        creator_address: worker.validatorAddress,
        withdrawal_address: worker.withdrawalAddress,
        signature: worker.signature
      }
      if (delegating_stake) {
        depositData.delegating_stake = delegating_stake
      }
      hexData = await web3.wat.validator.depositData(depositData)
    } else if (action === ActionTxType.deActivate) {
      value = 0
      if (delegating_stake) {
        from = delegating_stake.rules.exit.join(', ')
      }
      hexData = await web3.wat.validator.exitData({
        pubkey: worker.coordinatorPublicKey,
        creator_address: worker.validatorAddress
      })
    } else if (action === ActionTxType.withdraw) {
      value = 0
      if (delegating_stake) {
        from = delegating_stake.rules.withdrawal.join(', ')
      }
      hexData = await web3.wat.validator.withdrawalData({
        creator_address: worker.validatorAddress,
        amount: Web3.utils.toWei(`${amount || '0'}`, 'ether')
      })
    }

    return {
      hexData,
      value,
      to: await web3.wat.validator.depositAddress(),
      from
    }
  }

  private async _getDepositDataCount(path: string): Promise<number> {
    try {
      const data = await readJSON(path)
      const jsonData = JSON.parse(data)
      return jsonData.length
    } catch (err) {
      return 0
    }
  }

  private async _getDelegateRules(path: string): Promise<object> {
    try {
      const data = await readJSON(path)
      const jsonData = JSON.parse(data)
      return jsonData
    } catch (err) {
      return {}
    }
  }

  private async _getBalance(nodeId: number, address: string): Promise<Response<string>> {
    const nodeModel = this.nodeModel.getById(nodeId)
    if (!nodeModel) {
      return { status: 'error', message: ErrorResults.NODE_NOT_FOUND }
    }
    const web3 = getWeb3(getRPC(nodeModel.network))
    if (!web3 || !web3.currentProvider) {
      return { status: 'error', message: ErrorResults.NODE_NOT_FOUND }
    }
    const balance = await web3.eth.getBalance(address)
    return { status: 'success', data: balance ? web3.utils.fromWei(balance, 'ether') : '' }
  }
}

export default Worker

interface DelegatingStakeType {
  trial_period: string
  rules: {
    profit_share: Record<string, number>
    stake_share: Record<string, number>
    exit: string[]
    withdrawal: string[]
  }
  trial_rules?: {
    profit_share: Record<string, number>
    stake_share: Record<string, number>
    exit: string[]
    withdrawal: string[]
  }
}

interface DepositDataType {
  pubkey: string
  creator_address: string
  withdrawal_address: string
  signature: string
  delegating_stake?: DelegatingStakeType
}
