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
import { parentPort, workerData } from 'worker_threads'
import log from 'electron-log/node'
import { getMain } from '../../libs/db'
import AppEnv from '../../libs/appEnv'
import NodeModel, {
  Type as NodeType,
  CoordinatorStatus,
  CoordinatorValidatorStatus,
  ValidatorStatus
} from '../../models/node'
import WorkerModel from '../../models/worker'
import SettingsModel from '../../models/settings'
import LocalNode from '../../node/local'
import ProviderNode from '../../node/provider'
import { areObjectsEqual } from '../../helpers/common'
import { Event, EventName, SettingsUpdatedPayload } from '../../libs/EventBus'

const port = parentPort
if (!port) throw new Error('IllegalState')

class StatusMonitoring {
  private timeout: number = 12000
  private appEnv: AppEnv
  private nodeModel: NodeModel
  private workerModel: WorkerModel
  private settingsModel: SettingsModel
  private interval: NodeJS.Timeout | null = null
  private isStart = false

  constructor(appEnv: AppEnv) {
    this.appEnv = appEnv
    const db = getMain(this.appEnv.mainDB)
    this.nodeModel = new NodeModel(db)
    this.workerModel = new WorkerModel(db)
    this.settingsModel = new SettingsModel(db)

    const settings = this.settingsModel.get()
    if (settings?.monitoringInterval) {
      this.timeout = settings.monitoringInterval
    }

    this.onMessage = this.onMessage.bind(this)
    this.onListeners()
  }

  public start() {
    if (this.interval) {
      return
    }
    this.interval = setInterval(() => this._start(), this.timeout)
    log.debug('StatusMonitoring start', this.timeout)
  }

  public stop() {
    if (!this.interval) {
      return
    }
    clearInterval(this.interval)
    this.interval = null
    this.offListeners()
    log.debug('StatusMonitoring stop')
  }

  private onListeners() {
    port?.on('message', this.onMessage)
  }
  private offListeners() {
    port?.off('message', this.onMessage)
  }
  private async onMessage(event: Event<EventName, any>) {
    switch (event.type) {
      case EventName.StartStatusMonitoring: {
        this.start()
        break
      }
      case EventName.StopStatusMonitoring: {
        this.stop()
        break
      }
      case EventName.SettingsUpdated: {
        const payload = event.payload as Pick<SettingsUpdatedPayload, 'monitoringInterval'>
        this.updateTimeout(payload.monitoringInterval)
        break
      }
    }
  }

  private updateTimeout(timeout: number) {
    if (
      !Number.isInteger(timeout) ||
      timeout < 5000 ||
      timeout > 60000 ||
      timeout === this.timeout
    ) {
      return
    }

    this.timeout = timeout
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = setInterval(() => this._start(), this.timeout)
    }
    log.debug('StatusMonitoring timeout updated', this.timeout)
  }
  private async _start() {
    if (this.isStart) {
      return
    }
    this.isStart = true
    log.debug('status start')
    const nodes = this.nodeModel.getAll()

    for (const nodeModel of nodes) {
      try {
        if (
          nodeModel.type === NodeType.local &&
          nodeModel.coordinatorStatus === CoordinatorStatus.stopped &&
          nodeModel.validatorStatus === ValidatorStatus.stopped &&
          nodeModel.coordinatorValidatorStatus === CoordinatorValidatorStatus.stopped
        ) {
          continue
        }

        let data = {}

        const node =
          nodeModel.type === NodeType.local
            ? new LocalNode(nodeModel, this.appEnv)
            : new ProviderNode(nodeModel, this.appEnv)
        if (nodeModel.type === NodeType.local) {
          log.debug('status', 1)
        }
        let peers
        let sync
        try {
          peers = await node.getPeers()
        } catch (e) {
          log.error('peers', e)
        }
        if (nodeModel.type === NodeType.local) {
          log.debug('status', 2)
        }
        try {
          sync = await node.getSync()
        } catch (e) {
          log.error('sync', e)
        }
        if (nodeModel.type === NodeType.local) {
          log.debug(JSON.stringify(peers))
        }
        if (peers) {
          data = {
            ...data,
            ...peers
          }
        }
        if (sync) {
          data = {
            ...data,
            ...sync,
            coordinatorStatus:
              sync.coordinatorSyncDistance && sync.coordinatorSyncDistance > 10
                ? CoordinatorStatus.syncing
                : CoordinatorStatus.running,
            validatorStatus:
              sync.validatorSyncDistance && sync.validatorSyncDistance > 50
                ? ValidatorStatus.syncing
                : ValidatorStatus.running
          }
        }
        if (Object.keys(data).length > 0) this.nodeModel.update(nodeModel.id, data)

        if (
          sync?.coordinatorFinalizedEpoch &&
          nodeModel?.coordinatorFinalizedEpoch.toString() !==
            sync?.coordinatorFinalizedEpoch.toString()
        ) {
          const workers = this.workerModel.getByNodeId(nodeModel.id)
          const statuses = await node.getWorkerStatuses(workers)
          let index = 0
          for (const workerModel of workers) {
            try {
              const workerStatus = statuses[index]
              if (!areObjectsEqual(workerStatus, workerModel))
                this.workerModel.update(workerModel.id, workerStatus)
            } catch (error) {
              log.error(error)
            }
            index++
          }
        }
      } catch (error) {
        log.error(error)
      }
    }

    this.isStart = false
  }
}

const appEnv = new AppEnv({
  isPackaged: workerData.isPackaged,
  appPath: workerData.appPath,
  userData: workerData.userData,
  version: workerData.version
})
new StatusMonitoring(appEnv)
