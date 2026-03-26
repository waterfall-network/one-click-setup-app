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
import { LogLevel } from '../../models/settings'

const port = parentPort
if (!port) throw new Error('IllegalState')

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error)

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
    if (settings?.logLevel) {
      log.transports.file.level = settings.logLevel
    }

    this.onMessage = this.onMessage.bind(this)
    this.onListeners()
  }

  public start() {
    if (this.interval) {
      return
    }
    this.interval = setInterval(() => this._start(), this.timeout)
    log.info('status-monitoring:start', { intervalMs: this.timeout })
  }

  public stop() {
    if (!this.interval) {
      return
    }
    clearInterval(this.interval)
    this.interval = null
    this.offListeners()
    log.info('status-monitoring:stop')
  }

  private onListeners() {
    port?.on('message', this.onMessage)
  }
  private offListeners() {
    port?.off('message', this.onMessage)
  }
  private async onMessage(event: Event<EventName, any>) {
    log.debug('status-monitoring:event', { type: event.type })
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
        const payload = event.payload as Pick<
          SettingsUpdatedPayload,
          'monitoringInterval' | 'logLevel'
        >
        this.updateTimeout(payload.monitoringInterval)
        this.updateLogLevel(payload.logLevel)
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
    log.info('status-monitoring:interval-updated', { intervalMs: this.timeout })
  }

  private updateLogLevel(level: SettingsUpdatedPayload['logLevel']) {
    if (!Object.values(LogLevel).includes(level as LogLevel)) {
      return
    }
    log.transports.file.level = level
    log.info('status-monitoring:log-level-updated', { level })
  }
  private async _start() {
    if (this.isStart) {
      log.debug('status-monitoring:skip-cycle', { reason: 'already-running' })
      return
    }
    const startedAt = Date.now()
    this.isStart = true
    const nodes = this.nodeModel.getAll()
    let processedNodes = 0
    let skippedNodes = 0
    let updatedNodes = 0
    let peerFailures = 0
    let syncFailures = 0
    let workerStatusUpdates = 0
    let workerStatusUpdateFailures = 0
    let nodeCycleFailures = 0
    log.info('status-monitoring:cycle-start', { nodes: nodes.length, intervalMs: this.timeout })

    for (const nodeModel of nodes) {
      try {
        if (
          nodeModel.type === NodeType.local &&
          nodeModel.coordinatorStatus === CoordinatorStatus.stopped &&
          nodeModel.validatorStatus === ValidatorStatus.stopped &&
          nodeModel.coordinatorValidatorStatus === CoordinatorValidatorStatus.stopped
        ) {
          skippedNodes++
          log.debug('status-monitoring:node-skip', {
            nodeId: nodeModel.id,
            reason: 'stopped'
          })
          continue
        }
        if (
          nodeModel.type === NodeType.local &&
          (nodeModel.coordinatorStatus === CoordinatorStatus.starting ||
            nodeModel.validatorStatus === ValidatorStatus.starting) &&
          !nodeModel.coordinatorPid &&
          !nodeModel.validatorPid
        ) {
          skippedNodes++
          log.debug('status-monitoring:node-skip', {
            nodeId: nodeModel.id,
            reason: 'starting-without-pids'
          })
          continue
        }

        processedNodes++
        const nodeStartedAt = Date.now()
        let data = {}

        const node =
          nodeModel.type === NodeType.local
            ? new LocalNode(nodeModel, this.appEnv)
            : new ProviderNode(nodeModel, this.appEnv)
        let peers
        let sync
        try {
          peers = await node.getPeers()
        } catch (e) {
          peerFailures++
          log.error('status-monitoring:get-peers-failed', {
            nodeId: nodeModel.id,
            nodeType: nodeModel.type,
            error: getErrorMessage(e)
          })
        }
        try {
          sync = await node.getSync()
        } catch (e) {
          syncFailures++
          log.error('status-monitoring:get-sync-failed', {
            nodeId: nodeModel.id,
            nodeType: nodeModel.type,
            error: getErrorMessage(e)
          })
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
        if (Object.keys(data).length > 0) {
          updatedNodes++
          this.nodeModel.update(nodeModel.id, data)
        }
        log.debug('status-monitoring:node-updated', {
          nodeId: nodeModel.id,
          fieldsUpdated: Object.keys(data).length,
          hasPeers: !!peers,
          hasSync: !!sync,
          durationMs: Date.now() - nodeStartedAt
        })

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
              if (!areObjectsEqual(workerStatus, workerModel)) {
                workerStatusUpdates++
                this.workerModel.update(workerModel.id, workerStatus)
              }
            } catch (error) {
              workerStatusUpdateFailures++
              log.error('status-monitoring:update-worker-status-failed', {
                nodeId: nodeModel.id,
                workerId: workerModel.id,
                error: getErrorMessage(error)
              })
            }
            index++
          }
        }
      } catch (error) {
        nodeCycleFailures++
        log.error('status-monitoring:node-cycle-failed', {
          nodeId: nodeModel.id,
          error: getErrorMessage(error)
        })
      }
    }

    log.info('status-monitoring:cycle-done', {
      nodes: nodes.length,
      processedNodes,
      skippedNodes,
      updatedNodes,
      peerFailures,
      syncFailures,
      workerStatusUpdates,
      workerStatusUpdateFailures,
      nodeCycleFailures,
      durationMs: Date.now() - startedAt
    })
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
