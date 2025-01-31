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
import { EventName, Event } from '../../libs/EventBus'
import NodeModel, { Type as NodeType, DownloadStatus } from '../../models/node'
import LocalNode from '../../node/local'
import { delay } from '../../helpers/common'

const port = parentPort
if (!port) throw new Error('IllegalState')

interface WorkerMessage<T extends EventName, P> {
  type: T
  payload: P
}

class SnapshotMonitoring {
  private readonly timeout: number = 4000
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
    this.nodes = {}
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
    log.debug('SnapshotMonitoring start')
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
    log.debug('SnapshotMonitoring stop')
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
    }
  }
  private _pauseDownload(nodeId: number) {
    const nodeModel = this.nodeModel.getById(nodeId)
    if (!nodeModel || nodeModel.downloadStatus === DownloadStatus.finish) {
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
    }
  }
  private async _resumeDownload(nodeId: number) {
    const nodeModel = this.nodeModel.getById(nodeId)
    if (!nodeModel || nodeModel.downloadStatus === DownloadStatus.finish) {
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
    }
  }
  private async _start() {
    if (this.isStart) {
      return
    }
    this.isStart = true
    const nodes = this.nodeModel.getAll()
    for (const nodeModel of nodes) {
      if (nodeModel.type !== NodeType.local) {
        continue
      }
      try {
        if (
          this.nodes[nodeModel.id.toString()] &&
          nodeModel.downloadStatus === DownloadStatus.finish
        ) {
          this.nodes[nodeModel.id.toString()].removeAllListeners()
          delete this.nodes[nodeModel.id.toString()]
          continue
        }
        if (
          nodeModel.downloadStatus === DownloadStatus.downloadingPause ||
          nodeModel.downloadStatus === DownloadStatus.verifyingPause ||
          nodeModel.downloadStatus === DownloadStatus.extractingPause
        ) {
          continue
        }
        if (!this.nodes[nodeModel.id.toString()]) {
          this.nodes[nodeModel.id.toString()] = new LocalNode(nodeModel, this.appEnv)
          this.nodes[nodeModel.id.toString()].on('finishDownload', () => {
            log.debug('finishDownload', nodeModel.id)
            this.nodeModel.update(nodeModel.id, {
              downloadStatus: DownloadStatus.verifying
            })
            this.nodes[nodeModel.id.toString()].removeAllListeners()
            delete this.nodes[nodeModel.id.toString()]
          })
          this.nodes[nodeModel.id.toString()].on('finishVerified', (result) => {
            log.debug('finishVerified', nodeModel.id, result)
            this.nodeModel.update(nodeModel.id, {
              downloadStatus: result ? DownloadStatus.extracting : DownloadStatus.downloading
            })
            this.nodes[nodeModel.id.toString()].removeAllListeners()
            delete this.nodes[nodeModel.id.toString()]
          })
          this.nodes[nodeModel.id.toString()].on('finishExtracted', () => {
            log.debug('finishExtracted', nodeModel.id)
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
              log.debug(
                'progressDownload',
                nodeModel.id,
                percent,
                `${bytes}/${nodeModel.downloadSize}`
              )
              this.nodeModel.update(nodeModel.id, {
                downloadBytes: bytes
              })
            }
          })
          this.nodes[nodeModel.id.toString()].on('error', (error) => {
            log.error('error', nodeModel.id, error)
            this.nodes[nodeModel.id.toString()].removeAllListeners()
            delete this.nodes[nodeModel.id.toString()]
          })
          this.nodes[nodeModel.id.toString()].on('stopped', () => {
            log.error('stopped', nodeModel.id)
            this.nodes[nodeModel.id.toString()].removeAllListeners()
            delete this.nodes[nodeModel.id.toString()]
          })
        }
        await this.nodes[nodeModel.id.toString()].downloadSnapshot()
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

new SnapshotMonitoring(appEnv, 10000)
