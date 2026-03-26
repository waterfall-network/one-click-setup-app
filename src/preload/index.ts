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
/// <reference types="./index.d.ts" />
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { platform, homedir } from 'node:os'
import path from 'node:path'
import https from 'node:https'

import { node } from './node'
import { worker } from './worker'
import { settings } from './settings'

const STARTUP_STATUS_CHANNEL = 'startup:status'

type StartupPhase = 'running' | 'done' | 'error'

interface StartupStatus {
  phase: StartupPhase
  title: string
  detail: string
  activeStep: number
  completedSteps: number
  totalSteps: number
}

type FileFilter = { name: string; extensions: string[] }

const selectDirectory = (defaultPath?: string) =>
  ipcRenderer.invoke('os:selectDirectory', defaultPath)
const selectFile = (defaultPath?: string, filters?: FileFilter[]) =>
  ipcRenderer.invoke('os:selectFile', defaultPath, filters)
const selectSavePath = (title?: string, fileName?: string, filters?: FileFilter[]) =>
  ipcRenderer.invoke('os:selectSavePath', title, fileName, filters)

const saveTextFile = (text: string, title?: string, fileName?: string, filters?: FileFilter[]) =>
  ipcRenderer.invoke('os:saveTextFile', text, title, fileName, filters)

const openExternal = (url: string) => ipcRenderer.invoke('os:openExternal', url)

const quit = () => ipcRenderer.invoke('app:quit')

const fetchState = () => ipcRenderer.invoke('app:state')

const onStartupStatus = (callback: (status: StartupStatus) => void): (() => void) => {
  const listener = (_event: IpcRendererEvent, status: StartupStatus): void => {
    callback(status)
  }
  ipcRenderer.on(STARTUP_STATUS_CHANNEL, listener)
  return () => {
    ipcRenderer.removeListener(STARTUP_STATUS_CHANNEL, listener)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', { ...electronAPI })
    contextBridge.exposeInMainWorld('node', node)
    contextBridge.exposeInMainWorld('worker', worker)
    contextBridge.exposeInMainWorld('settings', settings)
    contextBridge.exposeInMainWorld('app', {
      quit,
      fetchState
    })
    contextBridge.exposeInMainWorld('startup', {
      onStatus: onStartupStatus
    })
    contextBridge.exposeInMainWorld('os', {
      platform: getPlatform(),
      homedir: getHomeDir(),
      selectDirectory: selectDirectory,
      selectFile: selectFile,
      selectSavePath: selectSavePath,
      saveTextFile: saveTextFile,
      openExternal: openExternal,
      path,
      fetchJSON
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // Fallback when context isolation is disabled (legacy)
  window.electron = electronAPI
  window.node = node
  window.worker = worker
  window.settings = settings
  window.os = {
    platform: getPlatform(),
    homedir: getHomeDir(),
    selectDirectory: selectDirectory,
    selectFile: selectFile,
    selectSavePath: selectSavePath,
    saveTextFile: saveTextFile,
    openExternal: openExternal,
    path,
    fetchJSON
  }
  window.app = { quit, fetchState }
  window.startup = { onStatus: onStartupStatus }
}

function getPlatform(): 'linux' | 'mac' | 'win' | null {
  switch (platform()) {
    case 'aix':
    case 'freebsd':
    case 'linux':
    case 'openbsd':
    case 'android':
      return 'linux'
    case 'darwin':
    case 'sunos':
      return 'mac'
    case 'win32':
      return 'win'
    default:
      return null
  }
}

function getHomeDir() {
  return homedir()
}

function fetchJSON(url: string): Promise<object> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      family: 4
    }
    const req = https.get(options, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        try {
          resolve(JSON.parse(data))
        } catch (e) {
          reject(e)
        }
      })
    })
    req.setTimeout(10000, () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })
    req.on('error', (e) => {
      reject(e)
    })
  })
}
