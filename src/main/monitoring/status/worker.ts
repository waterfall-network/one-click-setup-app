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
import NodeModel, { Type as NodeType, CoordinatorStatus, ValidatorStatus } from '../../models/node'
import WorkerModel from '../../models/worker'
import LocalNode from '../../node/local'
import ProviderNode from '../../node/provider'
import { areObjectsEqual } from '../../helpers/common'
import { Event, EventName } from '../../libs/EventBus'

const port = parentPort
if (!port) throw new Error('IllegalState')

class StatusMonitoring {
  private timeout: number = 4000
  private appEnv: AppEnv
  private nodeModel: NodeModel
  private workerModel: WorkerModel
  private interval: NodeJS.Timeout | null = null
  private isStart = false

  constructor(appEnv: AppEnv, timeout: number | undefined) {
    this.appEnv = appEnv
    const db = getMain(this.appEnv.mainDB)
    this.nodeModel = new NodeModel(db)
    this.workerModel = new WorkerModel(db)
    if (timeout) {
      this.timeout = timeout
    }
    this.onMessage = this.onMessage.bind(this)
    this.onListeners()
  }

  public start() {
    if (this.interval) {
      return
    }
    this.interval = setInterval(() => this._start(), this.timeout)
    log.debug('StatusMonitoring start')
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
    }
  }
  private async _start() {
    if (this.isStart) {
      return
    }
    this.isStart = true
    const nodes = this.nodeModel.getAll()

    for (const nodeModel of nodes) {
      try {
        let data = {}

        const node =
          nodeModel.type === NodeType.local
            ? new LocalNode(nodeModel, this.appEnv)
            : new ProviderNode(nodeModel, this.appEnv)
        const peers = await node.getPeers()
        const sync = await node.getSync()

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
          nodeModel.coordinatorFinalizedEpoch.toString() !==
            sync.coordinatorFinalizedEpoch.toString()
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
new StatusMonitoring(appEnv, 12000)
