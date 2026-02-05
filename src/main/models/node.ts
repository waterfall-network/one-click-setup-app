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
import log from 'electron-log/node'
import Database from 'better-sqlite3'
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
      return this.getById(res.lastInsertRowid)
    } catch (e) {
      log.error('node insert', e)
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
      const stmt = this.db.prepare(query)
      return stmt.all(...params) as Node[]
    } catch (error) {
      log.error(error)
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
