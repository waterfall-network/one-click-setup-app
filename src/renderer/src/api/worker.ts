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
import { Worker, ActionTxType, ActionTx } from '../types/workers'

export const genMnemonic = async (): Promise<string> => {
  return await window.worker.genMnemonic()
}

export const getAll = async (): Promise<Worker[]> => {
  return await window.worker.getAll()
}

export const getById = async (id: number | bigint): Promise<Worker> => {
  return await window.worker.getById(id)
}

export const getAllByNodeId = async (id: number | bigint): Promise<Worker[]> => {
  return await window.worker.getAllByNodeId(id)
}

export const add = async (data: {
  nodeId: number | bigint
  mnemonic?: string
  amount?: number
  withdrawalAddress?: string
  depositData?: string
  delegateRules?: string
}): Promise<{ status: 'success' | 'error'; message?: string; data?: Worker[] }> => {
  return await window.worker.add(data)
}

export const getActionTx = async (
  action: ActionTxType,
  id: number | bigint,
  amount?: string
): Promise<ActionTx> => {
  return await window.worker.getActionTx(action, id, amount)
}

export const remove = async (ids: (number | bigint)[]) => {
  return await window.worker.remove(ids)
}

export const sendActionTx = async (action: ActionTxType, ids: (number | bigint)[], pk: string) => {
  return await window.worker.sendActionTx(action, ids, pk)
}

export const getDepositDataCount = async (path: string) => {
  return await window.worker.getDepositDataCount(path)
}
export const getDelegateRules = async (path: string) => {
  return await window.worker.getDelegateRules(path)
}

export const getBalance = async (nodeId: number | bigint, address: string) => {
  return await window.worker.getBalance(nodeId, address)
}
