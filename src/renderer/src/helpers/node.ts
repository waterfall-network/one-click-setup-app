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
import {
  Node,
  CoordinatorStatus,
  ValidatorStatus,
  Status,
  DownloadStatus,
  ActionMap,
  Action,
  Snapshot,
  Snapshots,
  Type
} from '@renderer/types/node'

export const getNodeStatus = (node: Node) => {
  if (node.downloadStatus !== DownloadStatus.finish) {
    return node.downloadStatus
  } else if (
    node.coordinatorStatus === CoordinatorStatus.stopped &&
    node.validatorStatus === ValidatorStatus.stopped
  ) {
    return Status.stopped
  } else if (
    node.coordinatorStatus === CoordinatorStatus.syncing ||
    node.validatorStatus === ValidatorStatus.syncing
  ) {
    return Status.syncing
  }
  return Status.running
}

const StatusLabel = {
  [DownloadStatus.downloading]: 'Downloading',
  [DownloadStatus.downloadingPause]: 'Pause Download',
  [DownloadStatus.extracting]: 'Extracting',
  [DownloadStatus.extractingPause]: 'Pause Extract',
  [DownloadStatus.verifying]: 'Verifying',
  [DownloadStatus.verifyingPause]: 'Pause Verify',
  [Status.running]: 'Running',
  [Status.stopped]: 'Stopped',
  [Status.syncing]: 'Syncing'
}

export const getNodeStatusLabel = (node: Node) => {
  const status = getNodeStatus(node)
  if (status === DownloadStatus.downloading) {
    return `${StatusLabel[node.downloadStatus]} ${Math.floor((node.downloadBytes / node.downloadSize) * 100)}%`
  }
  return StatusLabel[status] || status
}

export const getActions = (node?: Node): ActionMap => {
  return {
    [Action.start]:
      node && node.type === Type.local
        ? (node.downloadStatus === DownloadStatus.finish &&
            getNodeStatus(node) === Status.stopped) ||
          getNodeStatus(node) === DownloadStatus.downloadingPause ||
          getNodeStatus(node) === DownloadStatus.extractingPause ||
          getNodeStatus(node) === DownloadStatus.verifyingPause
        : false,
    [Action.stop]:
      node && node.type === Type.local
        ? (node.downloadStatus === DownloadStatus.finish &&
            getNodeStatus(node) !== Status.stopped) ||
          getNodeStatus(node) === DownloadStatus.downloading ||
          getNodeStatus(node) === DownloadStatus.extracting ||
          getNodeStatus(node) === DownloadStatus.verifying
        : false,
    [Action.restart]:
      node && node.type === Type.local ? node?.downloadStatus === DownloadStatus.finish : false,
    [Action.remove]: node
      ? (node.downloadStatus === DownloadStatus.finish &&
          (getNodeStatus(node) === Status.stopped || node.type === Type.provider) &&
          node.workersCount === 0) ||
        getNodeStatus(node) === DownloadStatus.downloadingPause ||
        getNodeStatus(node) === DownloadStatus.extractingPause ||
        getNodeStatus(node) === DownloadStatus.verifyingPause
      : false
  }
}

export function isNetworkInfo(obj: any): obj is Snapshot {
  return (
    typeof obj === 'object' &&
    typeof obj.url === 'string' &&
    typeof obj.hash === 'string' &&
    typeof obj.size === 'number'
  )
}
export function isSnapshots(obj: any): obj is Snapshots {
  return typeof obj === 'object' && isNetworkInfo(obj.testnet8) && isNetworkInfo(obj.mainnet)
}

export const AddNodeStepKeys = {
  type: 'type',
  network: 'network',
  location: 'location',
  ports: 'ports',
  providerName: 'providerName',
  name: 'name',
  preview: 'preview'
}

export const getAddNodeSteps = (type: Type.local | Type.provider) => {
  let stepsWithKeys = [
    { title: 'Select Node type', key: AddNodeStepKeys.type },
    { title: 'Select a network', key: AddNodeStepKeys.network }
  ]

  if (type === Type.local) {
    stepsWithKeys = [
      ...stepsWithKeys,
      ...[
        { title: 'Select a data folder', key: AddNodeStepKeys.location },
        { title: 'Select ports', key: AddNodeStepKeys.ports }
      ]
    ]
  } else if (type === Type.provider) {
    stepsWithKeys = [
      ...stepsWithKeys,
      ...[{ title: 'Name your provider', key: AddNodeStepKeys.providerName }]
    ]
  }

  stepsWithKeys = [
    ...stepsWithKeys,
    ...[
      { title: 'Name your node', key: AddNodeStepKeys.name },
      { title: 'Preview', key: AddNodeStepKeys.preview }
    ]
  ]
  return {
    stepsWithKeys,
    steps: stepsWithKeys.map((el) => ({
      title: el.title
    }))
  }
}
