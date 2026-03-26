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
import { Worker, ActionTxType, ActionTx } from '../types/workers'

export const genMnemonic = async (): Promise<string> => {
  return await window.worker.genMnemonic()
}

export const getAll = async (
  page?: number,
  limit?: number,
  filters?: {
    status?: string[]
    nodeId?: (number | bigint)[]
    rewardMin?: number
    rewardMax?: number
  }
): Promise<{ data: Worker[]; total: number }> => {
  const [data, total] = await Promise.all([
    window.worker.getAll({ page, limit, filters }),
    window.worker.getCount({ filters })
  ])
  return { data, total: total || 0 }
}

export const getById = async (id: number | bigint): Promise<Worker> => {
  return await window.worker.getById(id)
}

export const getAllByNodeId = async (
  id: number | bigint,
  page?: number,
  limit?: number,
  filters?: {
    status?: string[]
    nodeId?: (number | bigint)[]
    rewardMin?: number
    rewardMax?: number
  }
): Promise<{ data: Worker[]; total: number }> => {
  const [data, total] = await Promise.all([
    window.worker.getAllByNodeId(id, { page, limit, filters }),
    window.worker.getCount({ nodeId: id, filters })
  ])
  return { data, total: total || 0 }
}

export const getCount = async (options?: {
  nodeId?: number | bigint
  filters?: {
    status?: string[]
    nodeId?: (number | bigint)[]
    rewardMin?: number
    rewardMax?: number
  }
}): Promise<number> => {
  const count = await window.worker.getCount(options)
  return count || 0
}

export interface WorkersStats {
  filters: {
    status: { [key: string]: number }
    node: { [key: string]: number }
  }
  rewardAmount: number
}

export const getStats = async (options?: {
  nodeId?: number | bigint
  filters?: {
    status?: string[]
    nodeId?: (number | bigint)[]
    rewardMin?: number
    rewardMax?: number
  }
}): Promise<WorkersStats | null> => {
  return await window.worker.getStats(options)
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

export const getTransactionCount = async (
  nodeId: number | bigint,
  address: string
): Promise<{
  status: 'success' | 'error'
  message?: string
  data?: { pending: number; latest: number }
}> => {
  return await window.worker.getTransactionCount(nodeId, address)
}
