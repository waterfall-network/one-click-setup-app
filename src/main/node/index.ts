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
import { getMain } from '../libs/db'
import AppEnv from '../libs/appEnv'
import EventBus, {
  EventName,
  EventName as EventBusEventName,
  Event as EventBusEvent,
  FinishDownloadSnapshotPayload
} from '../libs/EventBus'
import LocalNode, { StatusResult, StatusResults } from './local'
import ProviderNode from './provider'
import NodeModel, {
  CoordinatorStatus,
  CoordinatorValidatorStatus,
  DownloadStatus,
  NewNode,
  Node as NodeModelType,
  Type as NodeType,
  ValidatorStatus
} from '../models/node'
import WorkerModel from '../models/worker'
import SettingsModel from '../models/settings'
import { checkPort } from '../libs/fs'

enum ErrorResults {
  NODE_NOT_FOUND = 'Node Not Found',
  NODE_NOT_CREATED = 'Node Not Created'
}

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error)

class Node {
  private ipcMain: IpcMain
  private appEnv: AppEnv
  private eventBus: EventBus
  private nodeModel: NodeModel
  private workerModel: WorkerModel
  private settingsModel: SettingsModel

  private nodes: {
    [key: string]: LocalNode | ProviderNode
  }

  constructor(ipcMain: IpcMain, appEnv: AppEnv, eventBus: EventBus) {
    this.ipcMain = ipcMain
    this.appEnv = appEnv
    this.eventBus = eventBus
    this.nodes = {}
    const db = getMain(this.appEnv.mainDB)
    this.nodeModel = new NodeModel(db)
    this.workerModel = new WorkerModel(db)
    this.settingsModel = new SettingsModel(db)
    this._finishDownloadSnapshot = this._finishDownloadSnapshot.bind(this)
  }

  public async initialize(): Promise<boolean> {
    this.ipcMain.handle('node:start', (_event: IpcMainInvokeEvent, id) => this._start(id))
    this.ipcMain.handle('node:stop', (_event: IpcMainInvokeEvent, id) => this._stop(id))
    this.ipcMain.handle('node:restart', (_event: IpcMainInvokeEvent, id) => this._restart(id))
    this.ipcMain.handle('node:getAll', () => this.nodeModel.getAll())
    this.ipcMain.handle('node:getById', (_event: IpcMainInvokeEvent, id) =>
      this.nodeModel.getById(id)
    )
    this.ipcMain.handle('node:add', (_event: IpcMainInvokeEvent, options: NewNode) =>
      this._add(options)
    )
    this.ipcMain.handle('node:delete', (_event: IpcMainInvokeEvent, ids, withData) =>
      this._delete(ids, withData)
    )
    this.ipcMain.handle('node:checkPorts', (_event: IpcMainInvokeEvent, ports) =>
      this._checkPorts(ports)
    )
    this.eventBus.onEvent<EventBusEventName.FinishDownloadSnapshot, FinishDownloadSnapshotPayload>(
      EventName.FinishDownloadSnapshot,
      this._finishDownloadSnapshot
    )

    const nodeModels = this.nodeModel.getAll()
    const shouldAutoStartNodes = this.settingsModel.get()?.autoStartNodes ?? true

    let status = true
    for (const _nodeModel of nodeModels) {
      const statusAdd = await this._addNode(_nodeModel, shouldAutoStartNodes)
      if (!statusAdd && status) {
        status = false
      }
    }

    return status
  }
  public async destroy() {
    this.ipcMain.removeHandler('node:start')
    this.ipcMain.removeHandler('node:stop')
    this.ipcMain.removeHandler('node:restart')
    this.ipcMain.removeHandler('node:getAll')
    this.ipcMain.removeHandler('node:getById')
    this.ipcMain.removeHandler('node:add')
    this.ipcMain.removeHandler('node:delete')
    this.ipcMain.removeHandler('node:checkPorts')

    this.eventBus.offEvent<EventBusEventName.FinishDownloadSnapshot, FinishDownloadSnapshotPayload>(
      EventName.FinishDownloadSnapshot,
      this._finishDownloadSnapshot
    )

    for (const id of Object.keys(this.nodes)) {
      await this.nodes[id].stop()
    }
  }

  private async _start(id: number): Promise<StatusResults | ErrorResults | boolean> {
    const startedAt = Date.now()
    log.debug('node:start-requested', { nodeId: id })
    if (!this.nodes[id.toString()]) {
      const nodeModel = this.nodeModel.getById(id)
      if (!nodeModel) {
        return ErrorResults.NODE_NOT_FOUND
      }
      if (nodeModel.downloadStatus !== DownloadStatus.finish) {
        this.eventBus.emit(EventName.ResumeDownloadSnapshot, { nodeId: id })
        return true
      }
      await this._addNode(nodeModel)
    }
    const result = await this.nodes[id.toString()].start()
    log.info('node:start-finished', { nodeId: id, durationMs: Date.now() - startedAt })
    return result
  }

  private async _stop(id: number): Promise<StatusResults | ErrorResults | boolean> {
    const startedAt = Date.now()
    log.debug('node:stop-requested', { nodeId: id })
    if (!this.nodes[id.toString()]) {
      const nodeModel = this.nodeModel.getById(id)
      if (!nodeModel) {
        return ErrorResults.NODE_NOT_FOUND
      }
      if (nodeModel.downloadStatus !== DownloadStatus.finish) {
        this.eventBus.emit(EventName.PauseDownloadSnapshot, { nodeId: id })
        return true
      }
      await this._addNode(nodeModel)
    }
    const result = await this.nodes[id.toString()].stop()
    log.info('node:stop-finished', { nodeId: id, durationMs: Date.now() - startedAt })
    return result
  }

  private async _restart(id: number): Promise<StatusResults | ErrorResults> {
    const startedAt = Date.now()
    log.debug('node:restart-requested', { nodeId: id })
    if (!this.nodes[id.toString()]) {
      const nodeModel = this.nodeModel.getById(id)
      if (!nodeModel || nodeModel.downloadStatus !== DownloadStatus.finish) {
        return ErrorResults.NODE_NOT_FOUND
      }
      await this._addNode(nodeModel)
    }
    const result = await this.nodes[id.toString()].restart()
    log.info('node:restart-finished', { nodeId: id, durationMs: Date.now() - startedAt })
    return result
  }

  private async _add(options: NewNode): Promise<NodeModelType | ErrorResults> {
    const startedAt = Date.now()
    log.debug('node:add-requested', {
      name: options.name,
      type: options.type,
      network: options.network
    })
    const nodeModel = this.nodeModel.insert(options)
    if (!nodeModel) {
      log.error('node:add-failed', {
        reason: ErrorResults.NODE_NOT_CREATED,
        durationMs: Date.now() - startedAt
      })
      return ErrorResults.NODE_NOT_CREATED
    }
    const result = await this._addNode(nodeModel)
    if (result) {
      log.info('node:add-finished', { nodeId: nodeModel.id, durationMs: Date.now() - startedAt })
      return nodeModel
    }
    log.error('node:add-failed', {
      nodeId: nodeModel.id,
      reason: ErrorResults.NODE_NOT_CREATED,
      durationMs: Date.now() - startedAt
    })
    return ErrorResults.NODE_NOT_CREATED
  }

  private async _addNode(nodeModel: NodeModelType, autoStart = true) {
    if (nodeModel === null) return false
    if (nodeModel.downloadStatus !== DownloadStatus.finish) return true
    if (!this.nodes[nodeModel.id.toString()]) {
      this.nodes[nodeModel.id.toString()] =
        nodeModel.type === NodeType.local
          ? new LocalNode(nodeModel, this.appEnv)
          : new ProviderNode(nodeModel, this.appEnv)
    }
    const node = this.nodes[nodeModel.id.toString()]
    const initNodeStatus = await node.initialize()
    log.debug('node:initialize-status', { nodeId: nodeModel.id, status: initNodeStatus })
    node.on('stop', () => {
      if (nodeModel.type === NodeType.local) {
        const pids = node.getPids()
        this.nodeModel.update(nodeModel.id, {
          coordinatorPid: pids.coordinatorBeacon,
          coordinatorStatus: pids.coordinatorBeacon
            ? CoordinatorStatus.running
            : CoordinatorStatus.stopped,
          coordinatorPeersCount: 0,
          validatorPid: pids.validator,
          validatorStatus: pids.validator ? ValidatorStatus.running : ValidatorStatus.stopped,
          validatorPeersCount: 0,
          coordinatorValidatorPid: pids.coordinatorValidator,
          coordinatorValidatorStatus: pids.coordinatorValidator
            ? CoordinatorValidatorStatus.running
            : CoordinatorValidatorStatus.stopped
        })
        return
      }
      this.nodeModel.update(nodeModel.id, {
        coordinatorStatus: CoordinatorStatus.stopped,
        coordinatorPeersCount: 0,
        validatorStatus: ValidatorStatus.stopped,
        validatorPeersCount: 0,
        coordinatorValidatorStatus: CoordinatorValidatorStatus.stopped
      })
    })

    node.on('start', () => {
      if (nodeModel.type === NodeType.local) {
        const pids = node.getPids()
        this.nodeModel.update(nodeModel.id, {
          coordinatorPid: pids.coordinatorBeacon,
          coordinatorStatus: pids.coordinatorBeacon
            ? CoordinatorStatus.running
            : CoordinatorStatus.stopped,
          validatorPid: pids.validator,
          validatorStatus: pids.validator ? ValidatorStatus.running : ValidatorStatus.stopped,
          coordinatorValidatorPid: pids.coordinatorValidator,
          coordinatorValidatorStatus: pids.coordinatorValidator
            ? CoordinatorValidatorStatus.running
            : CoordinatorValidatorStatus.stopped
        })
        return
      }
      this.nodeModel.update(nodeModel.id, {
        coordinatorStatus: CoordinatorStatus.running,
        validatorStatus: ValidatorStatus.running,
        coordinatorValidatorStatus: CoordinatorValidatorStatus.running
      })
    })
    if (
      initNodeStatus.coordinatorBeacon === StatusResult.success &&
      initNodeStatus.validator === StatusResult.success &&
      initNodeStatus.coordinatorValidator === StatusResult.success
    ) {
      if (!autoStart) {
        if (nodeModel.type === NodeType.local) {
          const pids = node.getPids()
          this.nodeModel.update(nodeModel.id, {
            coordinatorPid: pids.coordinatorBeacon,
            coordinatorStatus: CoordinatorStatus.stopped,
            coordinatorPeersCount: 0,
            validatorPid: pids.validator,
            validatorStatus: ValidatorStatus.stopped,
            validatorPeersCount: 0,
            coordinatorValidatorPid: pids.coordinatorValidator,
            coordinatorValidatorStatus: CoordinatorValidatorStatus.stopped
          })
        } else {
          this.nodeModel.update(nodeModel.id, {
            coordinatorStatus: CoordinatorStatus.stopped,
            coordinatorPeersCount: 0,
            validatorStatus: ValidatorStatus.stopped,
            validatorPeersCount: 0,
            coordinatorValidatorStatus: CoordinatorValidatorStatus.stopped
          })
        }
        return true
      }

      try {
        await node.start()
      } catch (error) {
        log.error('node:start-failed', { nodeId: nodeModel.id, error: getErrorMessage(error) })
        return false
      }
      if (nodeModel.type === NodeType.local) {
        const pids = node.getPids()
        this.nodeModel.update(nodeModel.id, {
          coordinatorPid: pids.coordinatorBeacon,
          coordinatorStatus: pids.coordinatorBeacon
            ? CoordinatorStatus.running
            : CoordinatorStatus.stopped,
          validatorPid: pids.validator,
          validatorStatus: pids.validator ? ValidatorStatus.running : ValidatorStatus.stopped,
          coordinatorValidatorPid: pids.coordinatorValidator,
          coordinatorValidatorStatus: pids.coordinatorValidator
            ? CoordinatorValidatorStatus.running
            : CoordinatorValidatorStatus.stopped
        })
      }
      if (nodeModel.type === NodeType.provider) {
        this.nodeModel.update(nodeModel.id, {
          coordinatorStatus: CoordinatorStatus.running,
          validatorStatus: ValidatorStatus.running,
          coordinatorValidatorStatus: CoordinatorValidatorStatus.running
        })
      }

      return true
    }
    return false
  }

  private async _delete(
    ids: number[] | bigint[],
    withData = false
  ): Promise<boolean[] | ErrorResults> {
    const startedAt = Date.now()
    log.debug('node:delete-requested', {
      idsCount: ids?.length || 0,
      withData
    })
    if (!ids || ids.length == 0) {
      return ErrorResults.NODE_NOT_FOUND
    }

    const results = ids.map(() => false)

    for (const id of ids) {
      const nodeModel = this.nodeModel.getById(id)
      if (!nodeModel) {
        log.warn('node:delete-skip', { nodeId: id, reason: 'not-found' })
        continue
      }
      if (
        nodeModel.type === NodeType.local &&
        (nodeModel.coordinatorStatus !== CoordinatorStatus.stopped ||
          nodeModel.validatorStatus !== ValidatorStatus.stopped ||
          nodeModel.coordinatorValidatorStatus !== CoordinatorValidatorStatus.stopped)
      ) {
        log.warn('node:delete-skip', { nodeId: id, reason: 'node-running' })
        continue
      }
      const countWorkers = this.workerModel.getCount({ nodeId: id })
      if (countWorkers && countWorkers > 0) {
        log.warn('node:delete-skip', { nodeId: id, reason: 'workers-exist', workers: countWorkers })
        continue
      }

      const node =
        nodeModel.type === NodeType.local
          ? new LocalNode(nodeModel, this.appEnv)
          : new ProviderNode(nodeModel, this.appEnv)

      if (withData) {
        if (!(await node.removeData())) {
          log.error('node:delete-skip', { nodeId: id, reason: 'remove-data-failed' })
          continue
        }
      }

      const status = this.nodeModel.remove(id)
      const index = ids.findIndex((id) => id === nodeModel.id)
      results[index] = status
    }

    log.info('node:delete-finished', {
      requested: ids.length,
      deleted: results.filter(Boolean).length,
      durationMs: Date.now() - startedAt
    })
    return results
  }

  private async _checkPorts(ports: number[]) {
    const startedAt = Date.now()
    const result = await Promise.all(ports.map((port) => checkPort(port)))
    log.debug('node:check-ports-finished', {
      portsChecked: ports.length,
      available: result.filter(Boolean).length,
      durationMs: Date.now() - startedAt
    })
    return result
  }
  private async _finishDownloadSnapshot(
    event: EventBusEvent<EventName.FinishDownloadSnapshot, FinishDownloadSnapshotPayload>
  ) {
    try {
      log.debug('node:finish-download-snapshot-event', { nodeId: event.payload.nodeId })
      await this._start(event.payload.nodeId)
    } catch (error) {
      log.error('node:finish-download-snapshot-event-failed', {
        nodeId: event.payload.nodeId,
        error: getErrorMessage(error)
      })
    }
  }
}

export default Node
