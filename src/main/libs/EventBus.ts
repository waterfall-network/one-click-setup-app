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
import { EventEmitter } from 'node:events'

export enum EventName {
  StartDownloadSnapshot = 'StartDownloadSnapshot',
  FinishDownloadSnapshot = 'FinishDownloadSnapshot',
  PauseDownloadSnapshot = 'PauseDownloadSnapshot',
  ResumeDownloadSnapshot = 'ResumeDownloadSnapshot',
  StopDownloadSnapshot = 'StopDownloadSnapshot',
  StartStatusMonitoring = 'StartStatusMonitoring',
  StopStatusMonitoring = 'StopStatusMonitoring',
  SettingsUpdated = 'SettingsUpdated'
}

export interface Event<T extends EventName, P> {
  type: T
  payload: P
}

export type FinishDownloadSnapshotPayload = {
  nodeId: number
}
export type PauseDownloadSnapshotPayload = {
  nodeId: number
}
export type ResumeDownloadSnapshotPayload = {
  nodeId: number
}
export type StopDownloadSnapshotPayload = null
export type SettingsUpdatedPayload = {
  theme: 'light' | 'dark' | 'system'
  autoStartApp: boolean
  autoStartNodes: boolean
  monitoringInterval: number
  logLevel: 'debug' | 'info' | 'warn' | 'error'
}

class EventBus extends EventEmitter {
  public onEvent<T extends EventName, P>(
    type: T,
    listener: (event: Event<T, P>) => void | Promise<void>
  ): this {
    this.on(type, listener)
    return this
  }
  public offEvent<T extends EventName, P>(
    type: T,
    listener: (event: Event<T, P>) => void | Promise<void>
  ): this {
    this.off(type, listener)
    return this
  }

  public emitEvent<T extends EventName, P>(type: T, payload: P) {
    this.emit(type, { type, payload } as Event<T, P>)
  }
}
export default EventBus
