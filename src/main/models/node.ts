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
import Database from 'better-sqlite3'
import { getMain } from '../libs/db'
import {
  Network,
  COORDINATOR_HTTP_API_PORT,
  COORDINATOR_HTTP_VALIDATOR_API_PORT,
  COORDINATOR_P2P_TCP_PORT,
  COORDINATOR_P2P_UDP_PORT,
  VALIDATOR_HTTP_API_PORT,
  VALIDATOR_P2P_PORT,
  VALIDATOR_WS_API_PORT
} from '../libs/env'

import { Condition, appendCondition } from '../helpers/query'

type Database = ReturnType<typeof Database>
const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error)
export enum Type {
  local = 'local',
  remote = 'remote',
  provider = 'provider'
}

export enum CoordinatorStatus {
  stopped = 'stopped',
  running = 'running',
  syncing = 'syncing'
}

export enum CoordinatorValidatorStatus {
  stopped = 'stopped',
  running = 'running'
}

export enum ValidatorStatus {
  stopped = 'stopped',
  running = 'running',
  syncing = 'syncing'
}

export enum DownloadStatus {
  downloading = 'downloading',
  downloadingPause = 'downloadingPause',
  verifying = 'verifying',
  verifyingPause = 'verifyingPause',
  extracting = 'extracting',
  extractingPause = 'extractingPause',
  finish = 'finish'
}

export interface Node {
  id: number | bigint
  name: string
  network: Network
  type: Type
  locationDir: string
  coordinatorStatus: CoordinatorStatus
  coordinatorPeersCount: number
  coordinatorHeadSlot: bigint
  coordinatorSyncDistance: bigint
  coordinatorPreviousJustifiedEpoch: number
  coordinatorCurrentJustifiedEpoch: number
  coordinatorFinalizedEpoch: bigint
  coordinatorPid: number
  coordinatorValidatorStatus: CoordinatorValidatorStatus
  coordinatorValidatorPid: number
  validatorStatus: ValidatorStatus
  validatorPeersCount: number
  validatorHeadSlot: bigint
  validatorSyncDistance: bigint
  validatorFinalizedSlot: bigint
  validatorPid: number
  workersCount: number
  memoHash?: string
  coordinatorHttpApiPort: number
  coordinatorHttpValidatorApiPort: number
  coordinatorP2PTcpPort: number
  coordinatorP2PUdpPort: number
  validatorP2PPort: number
  validatorHttpApiPort: number
  validatorWsApiPort: number
  downloadStatus: DownloadStatus
  downloadUrl: string | null
  downloadHash: string | null
  downloadSize: number
  downloadBytes: number
  createdAt: string
  updatedAt: string
}

type RequiredNewNodeFields = Pick<Node, 'name' | 'network' | 'type' | 'locationDir'>
type OptionalNewNodeFields = Partial<
  Pick<
    Node,
    | 'coordinatorHttpApiPort'
    | 'coordinatorHttpValidatorApiPort'
    | 'coordinatorP2PTcpPort'
    | 'coordinatorP2PUdpPort'
    | 'validatorP2PPort'
    | 'validatorHttpApiPort'
    | 'validatorWsApiPort'
    | 'downloadStatus'
    | 'downloadUrl'
    | 'downloadHash'
    | 'downloadSize'
    | 'downloadBytes'
  >
>
export type NewNode = RequiredNewNodeFields & OptionalNewNodeFields
export type UpdateNode = Partial<Omit<Node, 'id' | 'createdAt' | 'updatedAt'>>

export interface WhereOptions {
  downloadStatus?: Condition<DownloadStatus>
}

export interface Options {
  ids?: number[]
}
class NodeModel {
  private db: Database | null = null
  constructor(db) {
    this.db = db
  }
  public insert(fields: NewNode): Node | null {
    if (!this.db) {
      return null
    }

    const query = this.db.prepare(
      'INSERT INTO nodes (' +
        'name, network, type, locationDir, ' +
        'coordinatorHttpApiPort, coordinatorHttpValidatorApiPort, coordinatorP2PTcpPort, coordinatorP2PUdpPort, ' +
        'validatorP2PPort, validatorHttpApiPort, validatorWsApiPort, ' +
        'downloadStatus, downloadUrl, downloadHash, downloadSize, downloadBytes' +
        ') VALUES (' +
        '@name, @network, @type, @locationDir, ' +
        '@coordinatorHttpApiPort, @coordinatorHttpValidatorApiPort, @coordinatorP2PTcpPort, @coordinatorP2PUdpPort, ' +
        '@validatorP2PPort, @validatorHttpApiPort, @validatorWsApiPort, ' +
        '@downloadStatus, @downloadUrl, @downloadHash, @downloadSize, @downloadBytes' +
        ')'
    )
    try {
      const startedAt = Date.now()
      const res = query.run({
        ...fields,
        coordinatorHttpApiPort: fields.coordinatorHttpApiPort || COORDINATOR_HTTP_API_PORT,
        coordinatorHttpValidatorApiPort:
          fields.coordinatorHttpValidatorApiPort || COORDINATOR_HTTP_VALIDATOR_API_PORT,
        coordinatorP2PTcpPort: fields.coordinatorP2PTcpPort || COORDINATOR_P2P_TCP_PORT,
        coordinatorP2PUdpPort: fields.coordinatorP2PUdpPort || COORDINATOR_P2P_UDP_PORT,
        validatorP2PPort: fields.validatorP2PPort || VALIDATOR_P2P_PORT,
        validatorHttpApiPort: fields.validatorHttpApiPort || VALIDATOR_HTTP_API_PORT,
        validatorWsApiPort: fields.validatorWsApiPort || VALIDATOR_WS_API_PORT,
        downloadStatus: fields.downloadStatus || DownloadStatus.finish,
        downloadUrl: fields.downloadUrl || null,
        downloadHash: fields.downloadHash || null,
        downloadSize: fields.downloadSize || 0,
        downloadBytes: fields.downloadBytes || 0
      })
      if (res.changes === 0) {
        return null
      }
      log.debug('node-model:insert', {
        name: fields.name,
        type: fields.type,
        network: fields.network,
        durationMs: Date.now() - startedAt
      })
      return this.getById(res.lastInsertRowid)
    } catch (e) {
      log.error('node-model:insert-failed', {
        name: fields.name,
        type: fields.type,
        network: fields.network,
        error: getErrorMessage(e)
      })
      return null
    }
  }

  getById(id: number | bigint): Node | null {
    if (!this.db) {
      return null
    }
    const res = this.db.prepare('SELECT * FROM nodes WHERE id = ?')
    return res.get(id) as Node
  }

  getAll(options?: WhereOptions): Node[] {
    if (!this.db) {
      return []
    }
    let query = 'SELECT * FROM nodes'

    const conditions: string[] = []
    const params: any[] = []
    if (options?.downloadStatus !== undefined) {
      appendCondition<DownloadStatus>('downloadStatus', options?.downloadStatus, conditions, params)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    try {
      const startedAt = Date.now()
      const stmt = this.db.prepare(query)
      const nodes = stmt.all(...params) as Node[]
      log.debug('node-model:get-all', {
        count: nodes.length,
        hasDownloadStatusFilter: options?.downloadStatus !== undefined,
        durationMs: Date.now() - startedAt
      })
      return nodes
    } catch (error) {
      log.error('node-model:get-all-failed', { error: getErrorMessage(error) })
      return []
    }
  }
  getAllByIds(ids: (number | bigint)[]): Node[] {
    if (!this.db) {
      return []
    }
    const placeholders = ids.map(() => '?').join(', ')
    const res = this.db.prepare(`SELECT * FROM nodes WHERE id IN (${placeholders})`)
    return res.all(...ids) as Node[]
  }

  clearAll(): boolean {
    if (!this.db) {
      return false
    }
    try {
      const startedAt = Date.now()
      const res = this.db.prepare('DELETE FROM nodes').run()
      log.debug('node-model:clear-all', {
        changes: res.changes,
        durationMs: Date.now() - startedAt
      })
      return res.changes >= 0
    } catch (error) {
      log.error('node-model:clear-all-failed', { error: getErrorMessage(error) })
      return false
    }
  }

  insertManyForImport(nodes: Record<string, unknown>[]): boolean {
    if (!this.db) {
      return false
    }
    try {
      const startedAt = Date.now()
      const insertNode = this.db.prepare(`
        INSERT INTO nodes (
          id, name, network, type, locationDir, memoHash,
          coordinatorHttpApiPort, coordinatorHttpValidatorApiPort, coordinatorP2PTcpPort, coordinatorP2PUdpPort,
          validatorP2PPort, validatorHttpApiPort, validatorWsApiPort,
          downloadStatus, downloadUrl, downloadHash, downloadSize, downloadBytes,
          coordinatorStatus, coordinatorValidatorStatus, validatorStatus,
          coordinatorPid, coordinatorValidatorPid, validatorPid,
          coordinatorPeersCount, coordinatorHeadSlot, coordinatorSyncDistance,
          coordinatorPreviousJustifiedEpoch, coordinatorCurrentJustifiedEpoch, coordinatorFinalizedEpoch,
          validatorPeersCount, validatorHeadSlot, validatorSyncDistance, validatorFinalizedSlot,
          workersCount,
          createdAt, updatedAt
        ) VALUES (
          @id, @name, @network, @type, @locationDir, @memoHash,
          @coordinatorHttpApiPort, @coordinatorHttpValidatorApiPort, @coordinatorP2PTcpPort, @coordinatorP2PUdpPort,
          @validatorP2PPort, @validatorHttpApiPort, @validatorWsApiPort,
          @downloadStatus, @downloadUrl, @downloadHash, @downloadSize, @downloadBytes,
          @coordinatorStatus, @coordinatorValidatorStatus, @validatorStatus,
          @coordinatorPid, @coordinatorValidatorPid, @validatorPid,
          @coordinatorPeersCount, @coordinatorHeadSlot, @coordinatorSyncDistance,
          @coordinatorPreviousJustifiedEpoch, @coordinatorCurrentJustifiedEpoch, @coordinatorFinalizedEpoch,
          @validatorPeersCount, @validatorHeadSlot, @validatorSyncDistance, @validatorFinalizedSlot,
          @workersCount,
          @createdAt, @updatedAt
        )
      `)

      for (const rawNode of nodes) {
        insertNode.run({
          id: rawNode.id,
          name: rawNode.name,
          network: rawNode.network,
          type: rawNode.type,
          locationDir: rawNode.locationDir,
          memoHash: rawNode.memoHash ?? null,
          coordinatorHttpApiPort: rawNode.coordinatorHttpApiPort,
          coordinatorHttpValidatorApiPort: rawNode.coordinatorHttpValidatorApiPort,
          coordinatorP2PTcpPort: rawNode.coordinatorP2PTcpPort,
          coordinatorP2PUdpPort: rawNode.coordinatorP2PUdpPort,
          validatorP2PPort: rawNode.validatorP2PPort,
          validatorHttpApiPort: rawNode.validatorHttpApiPort,
          validatorWsApiPort: rawNode.validatorWsApiPort,
          downloadStatus: rawNode.downloadStatus ?? 'finish',
          downloadUrl: rawNode.downloadUrl ?? null,
          downloadHash: rawNode.downloadHash ?? null,
          downloadSize: rawNode.downloadSize ?? 0,
          downloadBytes: rawNode.downloadBytes ?? 0,
          coordinatorStatus: 'stopped',
          coordinatorValidatorStatus: 'stopped',
          validatorStatus: 'stopped',
          coordinatorPid: null,
          coordinatorValidatorPid: null,
          validatorPid: null,
          coordinatorPeersCount: 0,
          coordinatorHeadSlot: 0,
          coordinatorSyncDistance: 0,
          coordinatorPreviousJustifiedEpoch: 0,
          coordinatorCurrentJustifiedEpoch: 0,
          coordinatorFinalizedEpoch: 0,
          validatorPeersCount: 0,
          validatorHeadSlot: 0,
          validatorSyncDistance: 0,
          validatorFinalizedSlot: 0,
          workersCount: rawNode.workersCount ?? 0,
          createdAt: rawNode.createdAt ?? undefined,
          updatedAt: rawNode.updatedAt ?? undefined
        })
      }
      log.debug('node-model:insert-many-import', {
        count: nodes.length,
        durationMs: Date.now() - startedAt
      })
      return true
    } catch (error) {
      log.error('node-model:insert-many-import-failed', {
        count: nodes.length,
        error: getErrorMessage(error)
      })
      return false
    }
  }

  syncWorkersCount(): boolean {
    if (!this.db) {
      return false
    }
    try {
      const startedAt = Date.now()
      this.db
        .prepare(
          `UPDATE nodes
           SET workersCount = (
             SELECT COUNT(*) FROM workers WHERE workers.nodeId = nodes.id
           )`
        )
        .run()
      log.debug('node-model:sync-workers-count', { durationMs: Date.now() - startedAt })
      return true
    } catch (error) {
      log.error('node-model:sync-workers-count-failed', { error: getErrorMessage(error) })
      return false
    }
  }

  remove(id: number | bigint): boolean {
    if (!this.db) {
      return false
    }
    const query = this.db.prepare('DELETE FROM nodes WHERE id = ?')
    const res = query.run(id)
    return !!res.changes
  }

  update(id: number | bigint, data: UpdateNode): boolean {
    if (!this.db) {
      return false
    }
    if (Object.keys(data).length === 0) return false

    const columns = Object.keys(data)
      .map((key) => `${key} = @${key}`)
      .join(', ')

    const query = this.db.prepare(`UPDATE nodes SET ${columns}  WHERE id = @id`)
    const res = query.run({
      ...data,
      id
    })
    return !!res.changes
  }
}
export default NodeModel

/** Opens a short-lived DB connection to check whether any nodes are configured. */
export function hasConfiguredNodes(dbPath: string): boolean {
  const db = getMain(dbPath)
  try {
    return new NodeModel(db).getAll().length > 0
  } finally {
    db.close()
  }
}
