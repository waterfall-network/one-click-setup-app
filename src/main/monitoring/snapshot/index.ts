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
import { Worker } from 'node:worker_threads'
import EventBus, {
  EventName,
  Event,
  FinishDownloadSnapshotPayload,
  PauseDownloadSnapshotPayload,
  ResumeDownloadSnapshotPayload,
  SettingsUpdatedPayload
} from '../../libs/EventBus'
import AppEnv from '../../libs/appEnv'
import workerPath from './worker?modulePath'

export const name = 'snapshot'
class Snapshot {
  private worker: Worker
  private eventBus: EventBus
  constructor(appEnv: AppEnv, eventBus: EventBus) {
    this.worker = new Worker(workerPath, {
      workerData: {
        isPackaged: appEnv.isPackaged,
        appPath: appEnv.appPath,
        userData: appEnv.userData,
        version: appEnv.version
      }
    })
    this.eventBus = eventBus
    this._sendToEventBus = this._sendToEventBus.bind(this)
    this._pauseDownload = this._pauseDownload.bind(this)
    this._resumeDownload = this._resumeDownload.bind(this)
    this._updateSettings = this._updateSettings.bind(this)
    this.onListeners()
  }
  private onListeners() {
    this.worker.on('message', this._sendToEventBus)

    this.eventBus.onEvent<EventName.PauseDownloadSnapshot, PauseDownloadSnapshotPayload>(
      EventName.PauseDownloadSnapshot,
      this._pauseDownload
    )
    this.eventBus.onEvent<EventName.ResumeDownloadSnapshot, ResumeDownloadSnapshotPayload>(
      EventName.ResumeDownloadSnapshot,
      this._resumeDownload
    )
    this.eventBus.onEvent<EventName.SettingsUpdated, SettingsUpdatedPayload>(
      EventName.SettingsUpdated,
      this._updateSettings
    )
  }
  private offListeners() {
    this.worker.off('message', this._sendToEventBus)
    this.eventBus.offEvent<EventName.PauseDownloadSnapshot, PauseDownloadSnapshotPayload>(
      EventName.PauseDownloadSnapshot,
      this._pauseDownload
    )
    this.eventBus.offEvent<EventName.ResumeDownloadSnapshot, ResumeDownloadSnapshotPayload>(
      EventName.ResumeDownloadSnapshot,
      this._resumeDownload
    )
    this.eventBus.offEvent<EventName.SettingsUpdated, SettingsUpdatedPayload>(
      EventName.SettingsUpdated,
      this._updateSettings
    )
  }

  private _sendToEventBus(event: Event<EventName, FinishDownloadSnapshotPayload>) {
    this.eventBus.emitEvent(event.type, event.payload)
  }
  private _pauseDownload(
    payload: Event<EventName.PauseDownloadSnapshot, PauseDownloadSnapshotPayload>
  ) {
    this.worker.postMessage({ type: EventName.PauseDownloadSnapshot, payload })
  }
  private _resumeDownload(
    payload: Event<EventName.ResumeDownloadSnapshot, ResumeDownloadSnapshotPayload>
  ) {
    this.worker.postMessage({ type: EventName.ResumeDownloadSnapshot, payload })
  }
  private _updateSettings(event: Event<EventName.SettingsUpdated, SettingsUpdatedPayload>) {
    this.worker.postMessage({
      type: EventName.SettingsUpdated,
      payload: {
        monitoringInterval: event.payload.monitoringInterval,
        logLevel: event.payload.logLevel
      }
    })
  }

  public start() {
    this.worker.postMessage({ type: EventName.StartDownloadSnapshot, payload: null })
  }
  public async destroy() {
    this.worker.postMessage({ type: EventName.StopDownloadSnapshot, payload: null })
    this.offListeners()
    await this.worker.terminate()
  }
}

export default Snapshot
