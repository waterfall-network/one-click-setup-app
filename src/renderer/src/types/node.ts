/*
 * Copyright 2026   Blue Wave Inc.
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
// NODE LIST TABLE
export enum Network {
  testnet8 = 'testnet8',
  testnet9 = 'testnet9',
  mainnet = 'mainnet'
}
export enum Type {
  local = 'local',
  remote = 'remote',
  provider = 'provider'
}

export enum Status {
  stopped = 'stopped',
  running = 'running',
  syncing = 'syncing'
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
  coordinatorFinalizedEpoch: number
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
export enum NodesListDataFields {
  id = 'id',
  name = 'name',
  type = 'type',
  locationDir = 'locationDir',
  createdAt = 'createdAt',
  workersCount = 'workersCount',
  status = 'status'
}

export type NodesListDataTypes = {
  [NodesListDataFields.id]: number | bigint
  [NodesListDataFields.name]: string
  [NodesListDataFields.type]: Type
  [NodesListDataFields.locationDir]: string
  [NodesListDataFields.createdAt]: string
  [NodesListDataFields.workersCount]: number
  [NodesListDataFields.status]: Status
}

// NODE WORKERS TABLE
export enum NodesWorkersDataFields {
  id = 'id',
  status = 'status',
  workedHours = 'workedHours',
  actions = 'actions',
  deposit = 'deposit'
}

export type NodesWorkersDataTypes = {
  [NodesWorkersDataFields.id]: string
  [NodesWorkersDataFields.status]?: string
  [NodesWorkersDataFields.workedHours]?: number
  [NodesWorkersDataFields.actions]?: string
  [NodesWorkersDataFields.deposit]?: {
    data?: string | null
    id: string
  }
}

export type NodeViewTabProps = {
  item?: Node
}

// NODE ADD

export enum CommonNodeFields {
  type = 'type',
  network = 'network',
  locationDir = 'locationDir',
  name = 'name',
  downloadStatus = 'downloadStatus',
  downloadUrl = 'downloadUrl',
  downloadHash = 'downloadHash',
  downloadSize = 'downloadSize'
}
export enum PortsNodeFields {
  coordinatorHttpApiPort = 'coordinatorHttpApiPort',
  coordinatorHttpValidatorApiPort = 'coordinatorHttpValidatorApiPort',
  coordinatorP2PTcpPort = 'coordinatorP2PTcpPort',
  coordinatorP2PUdpPort = 'coordinatorP2PUdpPort',
  validatorP2PPort = 'validatorP2PPort',
  validatorHttpApiPort = 'validatorHttpApiPort',
  validatorWsApiPort = 'validatorWsApiPort'
}
// Объединяем оба перечисления в одно
export enum AddNodeFields {
  type = CommonNodeFields.type,
  network = CommonNodeFields.network,
  locationDir = CommonNodeFields.locationDir,
  name = CommonNodeFields.name,
  downloadStatus = CommonNodeFields.downloadStatus,
  downloadUrl = CommonNodeFields.downloadUrl,
  downloadHash = CommonNodeFields.downloadHash,
  downloadSize = CommonNodeFields.downloadSize,
  coordinatorHttpApiPort = PortsNodeFields.coordinatorHttpApiPort,
  coordinatorHttpValidatorApiPort = PortsNodeFields.coordinatorHttpValidatorApiPort,
  coordinatorP2PTcpPort = PortsNodeFields.coordinatorP2PTcpPort,
  coordinatorP2PUdpPort = PortsNodeFields.coordinatorP2PUdpPort,
  validatorP2PPort = PortsNodeFields.validatorP2PPort,
  validatorHttpApiPort = PortsNodeFields.validatorHttpApiPort,
  validatorWsApiPort = PortsNodeFields.validatorWsApiPort
}

export type Ports = {
  [K in PortsNodeFields]?: number
}
export type CheckPorts = {
  [K in PortsNodeFields]?: boolean
}

export type Snapshot = {
  url: string
  hash: string
  size: number
}

export type Snapshots = {
  [K in Network]: Snapshot
}

export enum Action {
  stop = 'stop',
  start = 'start',
  restart = 'restart',
  remove = 'remove'
}

export type ActionMap = {
  [key in Action]: boolean
}
