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
    return this.nodes[id.toString()].start()
  }

  private async _stop(id: number): Promise<StatusResults | ErrorResults | boolean> {
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
    return this.nodes[id.toString()].stop()
  }

  private async _restart(id: number): Promise<StatusResults | ErrorResults> {
    if (!this.nodes[id.toString()]) {
      const nodeModel = this.nodeModel.getById(id)
      if (!nodeModel || nodeModel.downloadStatus !== DownloadStatus.finish) {
        return ErrorResults.NODE_NOT_FOUND
      }
      await this._addNode(nodeModel)
    }
    return this.nodes[id.toString()].restart()
  }

  private async _add(options: NewNode): Promise<NodeModelType | ErrorResults> {
    const nodeModel = this.nodeModel.insert(options)
    if (!nodeModel) {
      return ErrorResults.NODE_NOT_CREATED
    }
    const result = await this._addNode(nodeModel)
    if (result) {
      return nodeModel
    }
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
    log.debug('initNodeStatus', initNodeStatus)
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

      await node.start()
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
    log.debug('_delete', ids, withData)
    if (!ids || ids.length == 0) {
      return ErrorResults.NODE_NOT_FOUND
    }

    const results = ids.map(() => false)

    for (const id of ids) {
      const nodeModel = this.nodeModel.getById(id)
      if (!nodeModel) {
        continue
      }
      if (
        nodeModel.type === NodeType.local &&
        (nodeModel.coordinatorStatus !== CoordinatorStatus.stopped ||
          nodeModel.validatorStatus !== ValidatorStatus.stopped ||
          nodeModel.coordinatorValidatorStatus !== CoordinatorValidatorStatus.stopped)
      ) {
        continue
      }
      const countWorkers = this.workerModel.getCount({ nodeId: id })
      if (countWorkers && countWorkers > 0) {
        continue
      }

      const node =
        nodeModel.type === NodeType.local
          ? new LocalNode(nodeModel, this.appEnv)
          : new ProviderNode(nodeModel, this.appEnv)

      if (withData) {
        if (!(await node.removeData())) {
          continue
        }
      }

      const status = this.nodeModel.remove(id)
      const index = ids.findIndex((id) => id === nodeModel.id)
      results[index] = status
    }

    return results
  }

  private async _checkPorts(ports: number[]) {
    return await Promise.all(ports.map((port) => checkPort(port)))
  }
  private async _finishDownloadSnapshot(
    event: EventBusEvent<EventName.FinishDownloadSnapshot, FinishDownloadSnapshotPayload>
  ) {
    await this._start(event.payload.nodeId)
  }
}

export default Node
