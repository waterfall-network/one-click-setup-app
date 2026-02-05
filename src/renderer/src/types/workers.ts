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
import { Node } from './node'
export enum Status {
  pending_initialized = 'pending_initialized',
  pending_activation = 'pending_activation',
  active = 'active',
  active_exiting = 'active_exiting',
  exited = 'exited'
}

export enum CoordinatorStatus {
  pending_initialized = 'pending_initialized',
  pending_queued = 'pending_queued',
  pending_activation = 'pending_activation',
  active_ongoing = 'active_ongoing',
  active_exiting = 'active_exiting',
  active_slashed = 'active_slashed',
  exited_unslashed = 'exited_unslashed',
  exited_slashed = 'exited_slashed',
  withdrawal_possible = 'withdrawal_possible',
  withdrawal_done = 'withdrawal_done'
}

export enum ValidatorStatus {
  pending_initialized = 'pending_initialized',
  pending_activation = 'pending_activation',
  active = 'active',
  exited = 'exited'
}

export interface Worker {
  id: number | bigint
  validatorIndex?: number | bigint
  nodeId: number | bigint
  node?: Node
  number: number
  coordinatorStatus: CoordinatorStatus
  coordinatorPublicKey: string
  coordinatorBalanceAmount: string
  coordinatorActivationEpoch: string
  coordinatorDeActivationEpoch: string
  coordinatorBlockCreationCount: number
  coordinatorAttestationCreationCount: number
  validatorStatus: ValidatorStatus
  validatorAddress: string
  validatorBalanceAmount: string
  validatorActivationEpoch: string
  validatorDeActivationEpoch: string
  validatorBlockCreationCount: number
  withdrawalAddress: string
  signature: string
  delegate: DelegateRulesT
  stakeAmount: string
  createdAt: string
  updatedAt: string
}

type RequiredNewWorkerFields = Pick<
  Worker,
  'nodeId' | 'coordinatorPublicKey' | 'validatorAddress' | 'withdrawalAddress' | 'signature'
>
type OptionalNewWorkerFields = Partial<
  Pick<
    Worker,
    | 'coordinatorStatus'
    | 'coordinatorBalanceAmount'
    | 'coordinatorActivationEpoch'
    | 'coordinatorDeActivationEpoch'
    | 'coordinatorBlockCreationCount'
    | 'coordinatorAttestationCreationCount'
    | 'validatorStatus'
    | 'validatorBalanceAmount'
    | 'validatorActivationEpoch'
    | 'validatorDeActivationEpoch'
    | 'validatorBlockCreationCount'
    | 'stakeAmount'
  >
>

export type NewWorker = RequiredNewWorkerFields & OptionalNewWorkerFields

export type UpdateWorker = Partial<Omit<Worker, 'id' | 'createdAt' | 'updatedAt'>>

export enum WorkersListDataFields {
  id = 'id',
  validatorIndex = 'validatorIndex',
  nodeId = 'nodeId',
  node = 'node',
  status = 'status',
  coordinatorBalanceAmount = 'coordinatorBalanceAmount',
  actions = 'actions'
}

export type WorkersListDataTypes = {
  [WorkersListDataFields.id]: string
  [WorkersListDataFields.validatorIndex]: number
  [WorkersListDataFields.nodeId]: string
  [WorkersListDataFields.node]: Node
  [WorkersListDataFields.status]?: string
  [WorkersListDataFields.coordinatorBalanceAmount]?: string
  [WorkersListDataFields.actions]?: {
    data?: any
    id: string
  }
}

export type WorkersT = {
  id: string
  node: string
  status?: string
  workedHours?: number
  depositData?: any
}

export type WorkerViewTabProps = {
  item?: Worker
}

//ADD WORKER
export enum AddWorkerFields {
  node = 'node',
  mnemonic = 'mnemonic',
  mnemonicVerify = 'mnemonicVerify',
  amount = 'amount',
  withdrawalAddress = 'withdrawalAddress',
  depositData = 'depositData',
  delegateRules = 'delegateRules'
}

export type AddWorkerFormValuesT = {
  [AddWorkerFields.mnemonic]: string[]
  [AddWorkerFields.mnemonicVerify]: Record<number, string>
  [AddWorkerFields.amount]: number
  [AddWorkerFields.withdrawalAddress]: string
  [AddWorkerFields.depositData]: string
  [AddWorkerFields.delegateRules]: string
}

//IMPORT WORKER
export enum ImportWorkerFields {
  node = 'node',
  mnemonic = 'mnemonic',
  withdrawalAddress = 'withdrawalAddress',
  keys = 'keys'
}

export type ImportWorkerFormValuesT = {
  [AddWorkerFields.node]: string
  [AddWorkerFields.mnemonic]: Record<number, string>
  [AddWorkerFields.withdrawalAddress]: string
}

//DISPLAY KEYS TABLE
export type DisplayKeysDataType = {
  id: string
  coordinatorKey?: string
  validatorKey?: string
  withdrawalAddress?: string
}

export enum DisplayKeysFields {
  id = 'id',
  coordinatorKey = 'coordinatorKey',
  validatorKey = 'validatorKey',
  withdrawalAddress = 'withdrawalAddress'
}

// SEND TRANSACTION TABLE

export enum WorkerTransactionTableFields {
  id = 'id',
  depositAddress = 'depositAddress',
  hexData = 'hexData',
  value = 'value',
  qr = 'qr'
}

export type WorkerTransactionTableData = {
  [WorkerTransactionTableFields.id]: string
  [WorkerTransactionTableFields.depositAddress]: string
  [WorkerTransactionTableFields.hexData]: string
  [WorkerTransactionTableFields.value]: string
  [WorkerTransactionTableFields.qr]: string
}

export interface ActionTx {
  from: string
  to: string
  value: number | bigint
  hexData: string
}

export enum ActionTxType {
  activate = 'activate',
  deActivate = 'deActivate',
  withdraw = 'withdraw',
  remove = 'remove'
}

export type ActionTxTypeMap = {
  [key in ActionTxType]: boolean
}

interface Rules {
  profit_share: {
    [key: string]: number
  }
  stake_share: {
    [key: string]: number
  }
  exit: string[]
  withdrawal: string[]
}
export interface DelegateRulesT {
  trial_period?: number
  trial_rules?: Rules
  rules: Rules
}
