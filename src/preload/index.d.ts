/*
 * Copyright 2026   Digital Clever Solution Inc.
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
import { ElectronAPI } from '@electron-toolkit/preload'
import path from 'node:path'
import { node } from './node'
import { worker } from './worker'
import { settings } from './settings'
type State = {
  version: string
  binariesVersion: string
}

type StartupPhase = 'running' | 'done' | 'error'

type StartupStatus = {
  phase: StartupPhase
  title: string
  detail: string
  activeStep: number
  completedSteps: number
  totalSteps: number
}

type FileFilter = { name: string; extensions: string[] }

declare global {
  interface Window {
    electron: ElectronAPI
    node: node
    worker: worker
    settings: settings
    os: {
      platform: 'linux' | 'mac' | 'win' | null
      homedir: string
      selectDirectory: (defaultPath?: string) => Promise<string | null>
      selectFile: (defaultPath?: string, filters?: FileFilter[]) => Promise<string | null>
      selectSavePath: (
        title?: string,
        fileName?: string,
        filters?: FileFilter[]
      ) => Promise<string | null>
      saveTextFile: (
        text: string,
        title?: string,
        fileName?: string,
        filters?: FileFilter[]
      ) => Promise<boolean>
      openExternal: (url: string) => void
      path: path
      fetchJSON: (url: string) => Promise<object>
    }
    app: {
      quit: () => void
      fetchState: () => Promise<State>
    }
    startup: {
      onStatus: (callback: (status: StartupStatus) => void) => () => void
    }
  }
}
