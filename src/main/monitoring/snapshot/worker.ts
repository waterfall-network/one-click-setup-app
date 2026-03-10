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
import { parentPort, workerData } from 'worker_threads'
import log from 'electron-log/node'
import { getMain } from '../../libs/db'
import AppEnv from '../../libs/appEnv'
import { EventName, Event, SettingsUpdatedPayload } from '../../libs/EventBus'
import NodeModel, { Type as NodeType, DownloadStatus } from '../../models/node'
import LocalNode from '../../node/local'
import { delay } from '../../helpers/common'
import SettingsModel, { LogLevel } from '../../models/settings'

const port = parentPort
if (!port) throw new Error('IllegalState')

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error)

interface WorkerMessage<T extends EventName, P> {
  type: T
  payload: P
}

class SnapshotMonitoring {
  private timeout: number = 12000
  private readonly appEnv: AppEnv
  private nodeModel: NodeModel
  private interval: NodeJS.Timeout | null = null
  private isStart = false
  private readonly nodes: {
    [key: string]: LocalNode
  }

  constructor(appEnv: AppEnv, timeout: number | undefined) {
    this.appEnv = appEnv
    const db = getMain(this.appEnv.mainDB)
    this.nodeModel = new NodeModel(db)
    const settingsModel = new SettingsModel(db)
    const settings = settingsModel.get()
    if (settings?.monitoringInterval) {
      this.timeout = settings.monitoringInterval
    }
    if (settings?.logLevel) {
      log.transports.file.level = settings.logLevel
    }
    this.nodes = {}
    if (timeout && !settings?.monitoringInterval) {
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
    log.info('snapshot-monitoring:start', { intervalMs: this.timeout })
  }

  public async stop() {
    if (!this.interval) {
      return
    }
    clearInterval(this.interval)
    this.interval = null
    while (this.isStart) {
      await delay(100)
    }
    for (const node of Object.values(this.nodes)) {
      node.stopDownload()
    }
    this.offListeners()
    log.info('snapshot-monitoring:stop')
  }
  private sendWorkerMessage<T extends EventName>(message: WorkerMessage<T, any>) {
    if (port) {
      port.postMessage(message)
    }
  }
  private onListeners() {
    port?.on('message', this.onMessage)
  }
  private offListeners() {
    port?.off('message', this.onMessage)
  }
  private async onMessage(event: Event<EventName, any>) {
    log.debug('snapshot-monitoring:event', { type: event.type, nodeId: event?.payload?.nodeId })
    switch (event.type) {
      case EventName.StartDownloadSnapshot: {
        this.start()
        break
      }
      case EventName.StopDownloadSnapshot: {
        await this.stop()
        break
      }
      case EventName.PauseDownloadSnapshot: {
        this._pauseDownload(event?.payload?.nodeId)
        break
      }
      case EventName.ResumeDownloadSnapshot: {
        await this._resumeDownload(event?.payload?.nodeId)
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
    log.info('snapshot-monitoring:interval-updated', { intervalMs: this.timeout })
  }

  private updateLogLevel(level: SettingsUpdatedPayload['logLevel']) {
    if (!Object.values(LogLevel).includes(level as LogLevel)) {
      return
    }
    log.transports.file.level = level
  }
  private _pauseDownload(nodeId: number) {
    const nodeModel = this.nodeModel.getById(nodeId)
    if (!nodeModel || nodeModel.downloadStatus === DownloadStatus.finish) {
      log.debug('snapshot-monitoring:pause-skip', { nodeId, reason: 'not-found-or-finished' })
      return
    }
    const node = this.nodes[nodeId.toString()]
    if (node) {
      node.stopDownload()
    }
    let status: null | DownloadStatus = null
    if (nodeModel.downloadStatus === DownloadStatus.downloading) {
      status = DownloadStatus.downloadingPause
    } else if (nodeModel.downloadStatus === DownloadStatus.verifying) {
      status = DownloadStatus.verifyingPause
    } else if (nodeModel.downloadStatus === DownloadStatus.extracting) {
      status = DownloadStatus.extractingPause
    }

    if (status) {
      this.nodeModel.update(nodeModel.id, {
        downloadStatus: status
      })
      log.debug('snapshot-monitoring:paused', { nodeId, status })
    }
  }
  private async _resumeDownload(nodeId: number) {
    const nodeModel = this.nodeModel.getById(nodeId)
    if (!nodeModel || nodeModel.downloadStatus === DownloadStatus.finish) {
      log.debug('snapshot-monitoring:resume-skip', { nodeId, reason: 'not-found-or-finished' })
      return
    }
    let status: null | DownloadStatus = null
    if (nodeModel.downloadStatus === DownloadStatus.downloadingPause) {
      status = DownloadStatus.downloading
    } else if (nodeModel.downloadStatus === DownloadStatus.verifyingPause) {
      status = DownloadStatus.verifying
    } else if (nodeModel.downloadStatus === DownloadStatus.extractingPause) {
      status = DownloadStatus.extracting
    }

    if (status) {
      this.nodeModel.update(nodeModel.id, {
        downloadStatus: status
      })
      log.debug('snapshot-monitoring:resumed', { nodeId, status })
    }
  }
  private async _start() {
    if (this.isStart) {
      log.debug('snapshot-monitoring:skip-cycle', { reason: 'already-running' })
      return
    }
    const startedAt = Date.now()
    this.isStart = true
    const nodes = this.nodeModel.getAll()
    let localNodes = 0
    let pausedNodes = 0
    let cleanedFinishedNodes = 0
    let startedDownloads = 0
    let nodeCycleFailures = 0
    log.info('snapshot-monitoring:cycle-start', { nodes: nodes.length, intervalMs: this.timeout })
    for (const nodeModel of nodes) {
      if (nodeModel.type !== NodeType.local) {
        continue
      }
      localNodes++
      try {
        if (
          this.nodes[nodeModel.id.toString()] &&
          nodeModel.downloadStatus === DownloadStatus.finish
        ) {
          cleanedFinishedNodes++
          log.debug('snapshot-monitoring:cleanup-finished-node', { nodeId: nodeModel.id })
          this.nodes[nodeModel.id.toString()].removeAllListeners()
          delete this.nodes[nodeModel.id.toString()]
          continue
        }
        if (
          nodeModel.downloadStatus === DownloadStatus.downloadingPause ||
          nodeModel.downloadStatus === DownloadStatus.verifyingPause ||
          nodeModel.downloadStatus === DownloadStatus.extractingPause
        ) {
          pausedNodes++
          log.debug('snapshot-monitoring:node-paused', {
            nodeId: nodeModel.id,
            status: nodeModel.downloadStatus
          })
          continue
        }
        if (!this.nodes[nodeModel.id.toString()]) {
          log.debug('snapshot-monitoring:attach-node-listeners', {
            nodeId: nodeModel.id,
            status: nodeModel.downloadStatus
          })
          this.nodes[nodeModel.id.toString()] = new LocalNode(nodeModel, this.appEnv)
          this.nodes[nodeModel.id.toString()].on('finishDownload', () => {
            log.debug('snapshot-monitoring:finish-download', { nodeId: nodeModel.id })
            this.nodeModel.update(nodeModel.id, {
              downloadStatus: DownloadStatus.verifying
            })
            this.nodes[nodeModel.id.toString()].removeAllListeners()
            delete this.nodes[nodeModel.id.toString()]
          })
          this.nodes[nodeModel.id.toString()].on('finishVerified', (result) => {
            log.debug('snapshot-monitoring:finish-verified', { nodeId: nodeModel.id, result })
            this.nodeModel.update(nodeModel.id, {
              downloadStatus: result ? DownloadStatus.extracting : DownloadStatus.downloading
            })
            this.nodes[nodeModel.id.toString()].removeAllListeners()
            delete this.nodes[nodeModel.id.toString()]
          })
          this.nodes[nodeModel.id.toString()].on('finishExtracted', () => {
            log.debug('snapshot-monitoring:finish-extracted', { nodeId: nodeModel.id })
            this.nodeModel.update(nodeModel.id, {
              downloadStatus: DownloadStatus.finish
            })
            this.nodes[nodeModel.id.toString()].removeAllListeners()
            delete this.nodes[nodeModel.id.toString()]
            this.sendWorkerMessage<EventName.FinishDownloadSnapshot>({
              type: EventName.FinishDownloadSnapshot,
              payload: { nodeId: nodeModel.id }
            })
          })
          let percent = 0
          this.nodes[nodeModel.id.toString()].on('progressDownload', (bytes) => {
            const newPercent = Math.floor((bytes / nodeModel.downloadSize) * 100)
            if (percent !== newPercent) {
              percent = newPercent
              log.debug('snapshot-monitoring:download-progress', {
                nodeId: nodeModel.id,
                percent,
                bytes,
                totalBytes: nodeModel.downloadSize
              })
              this.nodeModel.update(nodeModel.id, {
                downloadBytes: bytes
              })
            }
          })
          this.nodes[nodeModel.id.toString()].on('error', (error) => {
            log.error('snapshot-monitoring:node-download-error', {
              nodeId: nodeModel.id,
              error: getErrorMessage(error)
            })
            this.nodes[nodeModel.id.toString()].removeAllListeners()
            delete this.nodes[nodeModel.id.toString()]
          })
          this.nodes[nodeModel.id.toString()].on('stopped', () => {
            log.warn('snapshot-monitoring:node-download-stopped', { nodeId: nodeModel.id })
            this.nodes[nodeModel.id.toString()].removeAllListeners()
            delete this.nodes[nodeModel.id.toString()]
          })
        }
        log.debug('snapshot-monitoring:start-download', {
          nodeId: nodeModel.id,
          status: nodeModel.downloadStatus
        })
        startedDownloads++
        await this.nodes[nodeModel.id.toString()].downloadSnapshot()
      } catch (error) {
        nodeCycleFailures++
        log.error('snapshot-monitoring:node-cycle-failed', {
          nodeId: nodeModel.id,
          error: getErrorMessage(error)
        })
      }
    }

    log.info('snapshot-monitoring:cycle-done', {
      nodes: nodes.length,
      localNodes,
      pausedNodes,
      cleanedFinishedNodes,
      startedDownloads,
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

new SnapshotMonitoring(appEnv, 10000)
