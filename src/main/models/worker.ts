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
import log from 'electron-log/node'
import Database from 'better-sqlite3'
import NodeModel, { Node } from './node'
import { getStakeAmount } from '../libs/env'

type Database = ReturnType<typeof Database>

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error)

export enum CoordinatorStatus {
  pending_initialized = 'pending_initialized',
  pending_queued = 'pending_queued',
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
  pending_exiting = 'pending_exiting',
  exited = 'exited'
}

export interface WorkerStatus {
  coordinatorPublicKey: string
  validatorAddress: string
  coordinatorStatus: CoordinatorStatus
  coordinatorBalanceAmount: string
  coordinatorActivationEpoch: string
  coordinatorDeActivationEpoch: string
  validatorStatus: ValidatorStatus
  validatorBalanceAmount: string
  validatorActivationEpoch: string
  validatorDeActivationEpoch: string
  stakeAmount: string
  validatorIndex: number
}

export interface Worker extends WorkerStatus {
  id: number | bigint
  nodeId: number | bigint
  node?: Node
  number: number
  coordinatorPublicKey: string
  coordinatorBlockCreationCount: number
  coordinatorAttestationCreationCount: number
  validatorAddress: string
  validatorBlockCreationCount: number
  withdrawalAddress: string
  signature: string
  delegate: string | null
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
    | 'delegate'
  >
>

export type NewWorker = RequiredNewWorkerFields & OptionalNewWorkerFields

export type UpdateWorker = Partial<Omit<Worker, 'id' | 'createdAt' | 'updatedAt'>>

export interface Options {
  withNode?: boolean
}

export interface PaginationOptions {
  page?: number
  limit?: number
}

export interface WhereOptions {
  nodeId?: number | bigint
}

export interface FilterOptions {
  status?: string[] // Computed status labels: 'Pending Initialized', 'Pending Activation', 'Active', 'Exiting', 'Exited'
  nodeId?: (number | bigint)[] // Filter by node IDs
  rewardMin?: number // Minimum reward amount (inclusive)
  rewardMax?: number // Maximum reward amount (inclusive)
}

// Helper function to compute status from coordinator and validator statuses
// Matches the logic from frontend helpers/workers.ts getStatus()
function computeStatus(
  coordinatorStatus: CoordinatorStatus,
  validatorStatus: ValidatorStatus
): string {
  if (
    coordinatorStatus === CoordinatorStatus.pending_initialized &&
    validatorStatus === ValidatorStatus.pending_initialized
  ) {
    return 'Pending Initialized'
  } else if (
    coordinatorStatus === CoordinatorStatus.pending_queued ||
    validatorStatus === ValidatorStatus.pending_initialized ||
    validatorStatus === ValidatorStatus.pending_activation
  ) {
    return 'Pending Activation'
  } else if (
    coordinatorStatus === CoordinatorStatus.active_ongoing ||
    coordinatorStatus === CoordinatorStatus.active_slashed ||
    validatorStatus === ValidatorStatus.active
  ) {
    return 'Active'
  } else if (
    coordinatorStatus === CoordinatorStatus.active_exiting ||
    coordinatorStatus === CoordinatorStatus.exited_unslashed ||
    coordinatorStatus === CoordinatorStatus.exited_slashed
  ) {
    return 'Exiting'
  }
  return 'Exited'
}

// Helper function to compute reward amount from worker balance and status
// Matches the logic from frontend components/Workers/WorkersListTable/Columns.tsx
function computeReward(
  coordinatorBalanceAmount: string,
  coordinatorStatus: CoordinatorStatus,
  validatorStatus: ValidatorStatus,
  stakeAmount: number
): number {
  const status = computeStatus(coordinatorStatus, validatorStatus)
  const balance = parseFloat(coordinatorBalanceAmount || '0')
  return status === 'Active' ? balance - stakeAmount : balance
}

interface StatsResult {
  filters: {
    status: { [key: string]: number }
    node: { [key: string]: number }
  }
  rewardAmount: number
}

class WorkerModel {
  private db: Database | null = null

  constructor(db) {
    this.db = db
  }

  private hasComputedFilters(filters?: FilterOptions): boolean {
    return !!(
      (filters?.status && filters.status.length > 0) ||
      filters?.rewardMin !== undefined ||
      filters?.rewardMax !== undefined
    )
  }

  public insert(workers: NewWorker[], node: Node): Worker[] {
    if (!this.db) {
      return []
    }

    const insertWorkerQuery = this.db.prepare(
      `INSERT INTO workers (nodeId, coordinatorPublicKey, validatorAddress, withdrawalAddress, signature, delegate) VALUES (@nodeId, @coordinatorPublicKey, @validatorAddress, @withdrawalAddress, @signature, @delegate)`
    )

    const updateNode = this.db.prepare(`UPDATE nodes SET memoHash = @memoHash  WHERE id = @id`)

    try {
      const startedAt = Date.now()
      const query = this.db.transaction((workers) => {
        for (const worker of workers) {
          insertWorkerQuery.run(worker)
        }

        updateNode.run({ id: node.id, memoHash: node.memoHash })
      })
      query(workers)
      const allWorkers = this.getByNodeId(node.id)
      log.debug('worker-model:insert', {
        nodeId: node.id,
        inserted: workers.length,
        durationMs: Date.now() - startedAt
      })
      return allWorkers.map((worker) => ({
        ...worker,
        node
      }))
    } catch (e) {
      log.error('worker-model:insert-failed', {
        nodeId: node.id,
        requested: workers.length,
        error: getErrorMessage(e)
      })
      return []
    }
  }

  getById(id: number | bigint, options?: Options): Worker | null {
    if (!this.db) {
      return null
    }
    const res = this.db.prepare('SELECT * FROM workers WHERE id = ?')
    const worker = res.get(id) as Worker

    if (worker && worker.delegate) {
      try {
        worker.delegate = JSON.parse(worker.delegate)
      } catch (e) {
        log.error('worker-model:get-by-id-parse-delegate-failed', {
          workerId: id,
          error: getErrorMessage(e)
        })
      }
    }

    if (options?.withNode && worker) {
      const nodeModel = new NodeModel(this.db)
      const node = nodeModel.getById(worker.nodeId)
      if (node) {
        worker.node = node
      }
    }

    return worker
  }

  getByPk(coordinatorPublicKey: string, options?: Options): Worker | null {
    if (!this.db) {
      return null
    }
    const res = this.db.prepare('SELECT * FROM workers WHERE coordinatorPublicKey = ?')
    const worker = res.get(coordinatorPublicKey) as Worker

    if (worker && worker.delegate) {
      try {
        worker.delegate = JSON.parse(worker.delegate)
      } catch (e) {
        log.error('worker-model:get-by-pk-parse-delegate-failed', {
          coordinatorPublicKey: coordinatorPublicKey.slice(0, 16),
          error: getErrorMessage(e)
        })
      }
    }

    if (options?.withNode && worker) {
      const nodeModel = new NodeModel(this.db)
      const node = nodeModel.getById(worker.nodeId)
      if (node) {
        worker.node = node
      }
    }

    return worker
  }
  getByNodeId(
    nodeId: number | bigint,
    options?: Options & PaginationOptions & { filters?: FilterOptions }
  ): Worker[] {
    if (!this.db) {
      return []
    }
    const query = 'SELECT * FROM workers WHERE nodeId = ?'
    const params: (number | bigint)[] = [nodeId]

    const res = this.db.prepare(query)
    let workers = res.all(...params) as Worker[]

    try {
      workers = workers.map((worker) => ({
        ...worker,
        delegate: worker.delegate ? JSON.parse(worker.delegate) : null
      }))
    } catch (e) {
      log.error('worker-model:get-by-node-id-parse-delegate-failed', {
        nodeId,
        error: getErrorMessage(e)
      })
    }

    // Apply filters
    if (options?.filters) {
      workers = this.applyFilters(workers, options.filters)
    }

    // Apply pagination after filtering
    if (options?.limit !== undefined) {
      const limit = options.limit
      const offset = options.page !== undefined ? (options.page - 1) * limit : 0
      workers = workers.slice(offset, offset + limit)
    }

    if (options?.withNode && workers.length > 0) {
      const nodeModel = new NodeModel(this.db)
      const node = nodeModel.getById(nodeId)
      if (node) {
        workers = workers.map((worker) => ({
          ...worker,
          node
        }))
      }
    }
    return workers
  }

  getByNodeIdLast(nodeId: number | bigint): Worker | null {
    if (!this.db) {
      return null
    }
    const res = this.db.prepare('SELECT * FROM workers WHERE nodeId = ? ORDER BY number DESC')
    return res.get(nodeId) as Worker
  }

  getAll(options?: Options & PaginationOptions & { filters?: FilterOptions }): Worker[] {
    if (!this.db) {
      return []
    }
    let query = 'SELECT * FROM workers'
    const params: (number | bigint)[] = []
    const hasComputedFilters = this.hasComputedFilters(options?.filters)

    // Apply nodeId filter in SQL if provided
    if (options?.filters?.nodeId && options.filters.nodeId.length > 0) {
      const placeholders = options.filters.nodeId.map(() => '?').join(',')
      query += ` WHERE nodeId IN (${placeholders})`
      params.push(...options.filters.nodeId)
    }

    // Fast path: when no computed filters are active, let SQLite do pagination.
    if (!hasComputedFilters && options?.limit !== undefined) {
      const limit = options.limit
      const offset = options.page !== undefined ? (options.page - 1) * limit : 0
      query += ' LIMIT ? OFFSET ?'
      params.push(limit, offset)
    }

    const res = this.db.prepare(query)
    let workers = res.all(...params) as Worker[]

    try {
      const startedAt = Date.now()
      workers = workers.map((worker) => ({
        ...worker,
        delegate: worker.delegate ? JSON.parse(worker.delegate) : null
      }))
      log.debug('worker-model:get-all', {
        count: workers.length,
        hasComputedFilters,
        withNode: !!options?.withNode,
        durationMs: Date.now() - startedAt
      })
    } catch (e) {
      log.error('worker-model:get-all-parse-delegate-failed', { error: getErrorMessage(e) })
    }

    // Apply status filter (computed status)
    if (options?.filters?.status && options.filters.status.length > 0) {
      const statusFilters = options.filters.status
      workers = workers.filter((worker) => {
        const computedStatus = computeStatus(worker.coordinatorStatus, worker.validatorStatus)
        return statusFilters.includes(computedStatus)
      })
    }

    // Apply reward filter if provided
    if (options?.filters?.rewardMin !== undefined || options?.filters?.rewardMax !== undefined) {
      // Load nodes to get stakeAmount for reward calculation
      const nodeModel = new NodeModel(this.db)
      const nodeIds = [...new Set(workers.map((w) => w.nodeId))]
      const nodes = nodeModel.getAllByIds(nodeIds)
      const nodesMap = {}
      nodes.forEach((node) => {
        nodesMap[node.id.toString()] = node
      })

      workers = workers.filter((worker) => {
        const node = nodesMap[worker.nodeId.toString()]
        if (!node) return false

        const stakeAmount = getStakeAmount(node.network)
        const reward = computeReward(
          worker.coordinatorBalanceAmount,
          worker.coordinatorStatus,
          worker.validatorStatus,
          stakeAmount
        )

        if (options.filters?.rewardMin !== undefined && reward < options.filters?.rewardMin) {
          return false
        }
        if (options.filters?.rewardMax !== undefined && reward > options.filters?.rewardMax) {
          return false
        }
        return true
      })
    }

    // Apply pagination in JS only when computed filters are active.
    if (hasComputedFilters && options?.limit !== undefined) {
      const limit = options.limit
      const offset = options.page !== undefined ? (options.page - 1) * limit : 0
      workers = workers.slice(offset, offset + limit)
    }

    if (options?.withNode && workers.length > 0) {
      const nodeModel = new NodeModel(this.db)
      const nodes = nodeModel.getAllByIds([...new Set(workers.map((worker) => worker.nodeId))])
      const nodesObject = {}
      nodes.forEach((node) => {
        nodesObject[node.id.toString()] = node
      })

      workers = workers.map((worker) => ({
        ...worker,
        node: nodesObject[worker.nodeId.toString()]
      }))
    }

    return workers
  }

  private applyFilters(workers: Worker[], filters: FilterOptions): Worker[] {
    let filtered = workers

    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      const statusFilters = filters.status
      filtered = filtered.filter((worker) => {
        const computedStatus = computeStatus(worker.coordinatorStatus, worker.validatorStatus)
        return statusFilters.includes(computedStatus)
      })
    }

    // Apply nodeId filter (if not already applied in SQL)
    if (filters.nodeId && filters.nodeId.length > 0) {
      const nodeIdFilters = filters.nodeId
      filtered = filtered.filter((worker) => nodeIdFilters.includes(worker.nodeId))
    }

    return filtered
  }
  getCount(options?: WhereOptions & { filters?: FilterOptions }): number | null {
    if (!this.db) {
      return null
    }
    let query = 'SELECT * FROM workers'
    const params: (number | bigint | string)[] = []
    const conditions: string[] = []
    const hasComputedFilters = this.hasComputedFilters(options?.filters)

    if (options?.nodeId !== undefined) {
      conditions.push('nodeId = ?')
      params.push(options.nodeId)
    }

    if (options?.filters?.nodeId && options.filters.nodeId.length > 0) {
      const placeholders = options.filters.nodeId.map(() => '?').join(',')
      if (conditions.length > 0) {
        conditions.push(`nodeId IN (${placeholders})`)
      } else {
        conditions.push(`nodeId IN (${placeholders})`)
      }
      params.push(...options.filters.nodeId)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    if (!hasComputedFilters) {
      const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count')
      try {
        const stmt = this.db.prepare(countQuery)
        const result = stmt.get(...params) as { count: number } | undefined
        return result?.count ?? 0
      } catch (error) {
        log.error('worker-model:get-count-fast-failed', { error: getErrorMessage(error) })
        return null
      }
    }

    try {
      const stmt = this.db.prepare(query)
      let workers = stmt.all(...params) as Worker[]

      // Apply status filter if provided
      if (options?.filters?.status && options.filters.status.length > 0) {
        const statusFilters = options.filters.status
        workers = workers.filter((worker) => {
          const computedStatus = computeStatus(worker.coordinatorStatus, worker.validatorStatus)
          return statusFilters.includes(computedStatus)
        })
      }

      // Apply reward filter if provided
      if (options?.filters?.rewardMin !== undefined || options?.filters?.rewardMax !== undefined) {
        // Load nodes to get stakeAmount for reward calculation
        const nodeModel = new NodeModel(this.db)
        const nodeIds = [...new Set(workers.map((w) => w.nodeId))]
        const nodes = nodeModel.getAllByIds(nodeIds)
        const nodesMap = {}
        nodes.forEach((node) => {
          nodesMap[node.id.toString()] = node
        })

        workers = workers.filter((worker) => {
          const node = nodesMap[worker.nodeId.toString()]
          if (!node) return false

          const stakeAmount = getStakeAmount(node.network)
          const reward = computeReward(
            worker.coordinatorBalanceAmount,
            worker.coordinatorStatus,
            worker.validatorStatus,
            stakeAmount
          )

          if (options.filters?.rewardMin !== undefined && reward < options.filters.rewardMin) {
            return false
          }
          if (options.filters?.rewardMax !== undefined && reward > options.filters.rewardMax) {
            return false
          }
          return true
        })
      }

      return workers.length
    } catch (error) {
      log.error('worker-model:get-count-failed', { error: getErrorMessage(error) })
      return null
    }
  }

  getStats(options?: WhereOptions & { filters?: FilterOptions }): StatsResult | null {
    if (!this.db) {
      return null
    }

    let query = 'SELECT * FROM workers'
    const params: (number | bigint)[] = []
    const conditions: string[] = []

    if (options?.nodeId !== undefined) {
      conditions.push('nodeId = ?')
      params.push(options.nodeId)
    }

    if (options?.filters?.nodeId && options.filters.nodeId.length > 0) {
      const placeholders = options.filters.nodeId.map(() => '?').join(',')
      if (conditions.length > 0) {
        conditions.push(`nodeId IN (${placeholders})`)
      } else {
        conditions.push(`nodeId IN (${placeholders})`)
      }
      params.push(...options.filters.nodeId)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    try {
      const stmt = this.db.prepare(query)
      let workers = stmt.all(...params) as Worker[]

      // Load nodes for filtering and reward calculation
      const nodeModel = new NodeModel(this.db)
      const nodeIds = [...new Set(workers.map((w) => w.nodeId))]
      const nodes = nodeModel.getAllByIds(nodeIds)
      const nodesMap = {}
      nodes.forEach((node) => {
        nodesMap[node.id.toString()] = node
      })

      // Apply status filter if provided
      if (options?.filters?.status && options.filters.status.length > 0) {
        const statusFilters = options.filters.status
        workers = workers.filter((worker) => {
          const computedStatus = computeStatus(worker.coordinatorStatus, worker.validatorStatus)
          return statusFilters.includes(computedStatus)
        })
      }

      // Apply reward filter if provided
      if (options?.filters?.rewardMin !== undefined || options?.filters?.rewardMax !== undefined) {
        workers = workers.filter((worker) => {
          const node = nodesMap[worker.nodeId.toString()]
          if (!node) return false

          const stakeAmount = getStakeAmount(node.network)
          const reward = computeReward(
            worker.coordinatorBalanceAmount,
            worker.coordinatorStatus,
            worker.validatorStatus,
            stakeAmount
          )

          if (options.filters?.rewardMin !== undefined && reward < options.filters.rewardMin) {
            return false
          }
          if (options.filters?.rewardMax !== undefined && reward > options.filters.rewardMax) {
            return false
          }
          return true
        })
      }

      // Calculate statistics
      const statusCounts: { [key: string]: number } = {}
      const nodeCounts: { [key: string]: number } = {}
      let rewardAmount = 0

      workers.forEach((worker) => {
        const computedStatus = computeStatus(worker.coordinatorStatus, worker.validatorStatus)
        statusCounts[computedStatus] = (statusCounts[computedStatus] || 0) + 1

        const node = nodesMap[worker.nodeId.toString()]
        if (node) {
          nodeCounts[node.name] = (nodeCounts[node.name] || 0) + 1

          // Calculate reward amount
          if (computedStatus !== 'Pending Initialized') {
            const stakeAmount = getStakeAmount(node.network)
            const balance = parseFloat(worker.coordinatorBalanceAmount || '0')
            const reward = computedStatus === 'Active' ? balance - stakeAmount : balance
            rewardAmount += reward
          }
        }
      })

      return {
        filters: {
          status: statusCounts,
          node: nodeCounts
        },
        rewardAmount
      }
    } catch (error) {
      log.error('worker-model:get-stats-failed', { error: getErrorMessage(error) })
      return null
    }
  }

  remove(id: number | bigint): boolean {
    if (!this.db) {
      return false
    }
    const query = this.db.prepare('DELETE FROM workers WHERE id = ?')
    const res = query.run(id)
    return !!res.changes
  }

  clearAll(): boolean {
    if (!this.db) {
      return false
    }
    try {
      const startedAt = Date.now()
      const res = this.db.prepare('DELETE FROM workers').run()
      log.debug('worker-model:clear-all', {
        changes: res.changes,
        durationMs: Date.now() - startedAt
      })
      return res.changes >= 0
    } catch (error) {
      log.error('worker-model:clear-all-failed', { error: getErrorMessage(error) })
      return false
    }
  }

  insertManyForImport(workers: Record<string, unknown>[]): boolean {
    if (!this.db) {
      return false
    }

    try {
      const startedAt = Date.now()
      const insertWorker = this.db.prepare(`
        INSERT INTO workers (
          id, nodeId, number,
          coordinatorStatus, coordinatorPublicKey, coordinatorBalanceAmount,
          coordinatorActivationEpoch, coordinatorDeActivationEpoch, coordinatorBlockCreationCount, coordinatorAttestationCreationCount,
          validatorStatus, validatorAddress, validatorBalanceAmount, validatorActivationEpoch, validatorDeActivationEpoch, validatorBlockCreationCount,
          withdrawalAddress, signature, stakeAmount, delegate, validatorIndex,
          createdAt, updatedAt
        ) VALUES (
          @id, @nodeId, @number,
          @coordinatorStatus, @coordinatorPublicKey, @coordinatorBalanceAmount,
          @coordinatorActivationEpoch, @coordinatorDeActivationEpoch, @coordinatorBlockCreationCount, @coordinatorAttestationCreationCount,
          @validatorStatus, @validatorAddress, @validatorBalanceAmount, @validatorActivationEpoch, @validatorDeActivationEpoch, @validatorBlockCreationCount,
          @withdrawalAddress, @signature, @stakeAmount, @delegate, @validatorIndex,
          @createdAt, @updatedAt
        )
      `)

      for (const rawWorker of workers) {
        insertWorker.run({
          id: rawWorker.id,
          nodeId: rawWorker.nodeId,
          number: rawWorker.number ?? 0,
          coordinatorStatus: rawWorker.coordinatorStatus ?? 'pending_initialized',
          coordinatorPublicKey: rawWorker.coordinatorPublicKey,
          coordinatorBalanceAmount: rawWorker.coordinatorBalanceAmount ?? '0',
          coordinatorActivationEpoch: rawWorker.coordinatorActivationEpoch ?? '',
          coordinatorDeActivationEpoch: rawWorker.coordinatorDeActivationEpoch ?? '',
          coordinatorBlockCreationCount: rawWorker.coordinatorBlockCreationCount ?? 0,
          coordinatorAttestationCreationCount: rawWorker.coordinatorAttestationCreationCount ?? 0,
          validatorStatus: rawWorker.validatorStatus ?? 'pending_initialized',
          validatorAddress: rawWorker.validatorAddress,
          validatorBalanceAmount: rawWorker.validatorBalanceAmount ?? '0',
          validatorActivationEpoch: rawWorker.validatorActivationEpoch ?? '',
          validatorDeActivationEpoch: rawWorker.validatorDeActivationEpoch ?? '',
          validatorBlockCreationCount: rawWorker.validatorBlockCreationCount ?? 0,
          withdrawalAddress: rawWorker.withdrawalAddress,
          signature: rawWorker.signature,
          stakeAmount: rawWorker.stakeAmount ?? '0',
          delegate:
            rawWorker.delegate === null || rawWorker.delegate === undefined
              ? null
              : typeof rawWorker.delegate === 'string'
                ? rawWorker.delegate
                : JSON.stringify(rawWorker.delegate),
          validatorIndex: rawWorker.validatorIndex ?? 0,
          createdAt: rawWorker.createdAt ?? undefined,
          updatedAt: rawWorker.updatedAt ?? undefined
        })
      }

      log.debug('worker-model:insert-many-import', {
        count: workers.length,
        durationMs: Date.now() - startedAt
      })
      return true
    } catch (error) {
      log.error('worker-model:insert-many-import-failed', {
        count: workers.length,
        error: getErrorMessage(error)
      })
      return false
    }
  }

  update(id: number | bigint, data: UpdateWorker): boolean {
    if (!this.db) {
      return false
    }
    if (Object.keys(data).length === 0) return false

    const columns = Object.keys(data)
      .map((key) => `${key} = @${key}`)
      .join(', ')

    const query = this.db.prepare(`UPDATE workers SET ${columns}  WHERE id = @id`)
    const res = query.run({
      ...data,
      id
    })
    return !!res.changes
  }
}

export default WorkerModel
