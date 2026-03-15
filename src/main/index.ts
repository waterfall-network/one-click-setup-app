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
import {
  app,
  BrowserWindow,
  Tray,
  ipcMain,
  globalShortcut,
  powerSaveBlocker,
  dialog
} from 'electron'
import { Event } from 'electron'
import { autoUpdater } from 'electron-updater'
import { join } from 'path'
import log from 'electron-log/main'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/app/iconTemplate.png?asset'
import trayIcon from '../../resources/tray/iconTemplate.png?asset'
import EventBus from './libs/EventBus'
import Node from './node'
import Worker from './worker'
import AppEnv from './libs/appEnv'
import { runMigrations } from './libs/migrate'
import StatusWorker from './monitoring/status'
import SnapshotWorker from './monitoring/snapshot'
import FsHandle from './libs/FsHandle'
import Settings from './settings'
import { createMainWindow } from './windows/createMainWindow'
import { createUpdateWindow } from './windows/createUpdateWindow'
import { createStartupSteps } from './startup/steps'
import { runStartup } from './startup/runner'
import type { StartupStatus } from './startup/types'
import { initializeTrayAndHandlers } from './app/initializeTrayAndHandlers'
import { syncBinaries } from './libs/binUpdater'
import { hasConfiguredNodes } from './models/node'

app.commandLine.appendSwitch('no-sandbox')

log.transports.file.level = 'debug'
autoUpdater.logger = log

const STARTUP_STATUS_CHANNEL = 'startup:status'
const STARTUP_STEP_DELAY_MS = 100

const eventBus = new EventBus()
let tray: null | Tray = null
let preventSleepId: null | number = null
let mainWindow: null | BrowserWindow = null
let updateWindow: null | BrowserWindow = null
let isQuitting = false
const appEnv = new AppEnv({
  isPackaged: app.isPackaged,
  appPath: app.getAppPath(),
  userData: app.getPath('userData'),
  version: app.getVersion()
})
const node = new Node(ipcMain, appEnv, eventBus)
const worker = new Worker(ipcMain, appEnv)
const fsHandle = new FsHandle(ipcMain)
const settings = new Settings(ipcMain, appEnv, eventBus)
const statusWorker = new StatusWorker(appEnv, eventBus)
const snapshotWorker = new SnapshotWorker(appEnv, eventBus)

let updateWindowReady = false
let pendingStartupStatus: StartupStatus | null = null

// Keep renderer console output out of main process logs to reduce leakage risk.
log.initialize({ spyRendererConsole: false })

process.on('uncaughtException', (error) => {
  log.error(`Uncaught Exception: ${error.message}`)
  log.error(error.stack)
})

const checkForUpdates = (): void => {
  autoUpdater.checkForUpdatesAndNotify()
  log.info('check update')
}

const setUpdateWindowStatus = (status: StartupStatus): void => {
  pendingStartupStatus = status
  if (!updateWindow || updateWindow.isDestroyed() || !updateWindowReady) {
    return
  }
  updateWindow.webContents.send(STARTUP_STATUS_CHANNEL, status)
}

const createMainAppWindow = (): void => {
  const preloadPath = join(__dirname, '../preload/index.js')
  const indexHtmlPath = join(__dirname, '../renderer/index.html')
  mainWindow = createMainWindow({
    icon,
    preloadPath,
    indexHtmlPath,
    isDev: is.dev,
    rendererUrl: process.env['ELECTRON_RENDERER_URL'],
    onReadyToShow: () => {
      if (updateWindow) {
        updateWindow.close()
      }
    },
    onCloseRequest: (event: Event, window: BrowserWindow) => {
      if (!isQuitting) {
        event.preventDefault()
        window.hide()
        showExitConfirmation()
      }
    }
  })
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.setName('Waterfall')

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }
      mainWindow.show()
      mainWindow.focus()
    }
  })

  app.whenReady().then(async () => {
    electronApp.setAppUserModelId('app.waterfall')

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    if (appEnv.getPlatform() === 'mac') {
      app.dock?.setIcon(icon)
    }

    const preloadPath = join(__dirname, '../preload/index.js')
    const updateHtmlPath = join(__dirname, '../renderer/update.html')
    updateWindowReady = false
    updateWindow = createUpdateWindow({
      icon,
      preloadPath,
      updateHtmlPath,
      isDev: is.dev,
      rendererUrl: process.env['ELECTRON_RENDERER_URL'],
      onDidFinishLoad: () => {
        updateWindowReady = true
        if (pendingStartupStatus) {
          setUpdateWindowStatus(pendingStartupStatus)
        }
      },
      onClosed: async () => {
        updateWindowReady = false
        pendingStartupStatus = null
        updateWindow = null
        if (!isQuitting && mainWindow === null) {
          isQuitting = true
          await quit()
        }
      }
    })

    const startupSteps = createStartupSteps({
      runMigrations: async () => await runMigrations(),
      hasConfiguredNodes: () => hasConfiguredNodes(appEnv.mainDB),
      syncBinaries: async (hasNodes, updateProgress) => {
        const result = await syncBinaries(hasNodes, updateProgress, eventBus)
        if (result?.version) {
          settings.updateBinariesVersion(result.version)
        }
      },
      checkForUpdates,
      initializeSettings: async () => await settings.initialize(),
      initializeNode: async () => await node.initialize(),
      initializeWorker: async () => await worker.initialize(),
      initializeFsHandle: () => {
        fsHandle.initialize()
      },
      startStatusWorker: () => {
        statusWorker.start()
      },
      startSnapshotWorker: () => {
        snapshotWorker.start()
      },
      configurePowerManagement: () => {
        preventSleepId = powerSaveBlocker.start('prevent-app-suspension')
      },
      finalizeApplicationShell: () => {
        tray = initializeTrayAndHandlers({
          trayIcon,
          ipcMain,
          appVersion: appEnv.version,
          getBinariesVersion: () => settings.getSettings()?.binariesVersion ?? '',
          checkForUpdates,
          quit,
          getMainWindow: () => mainWindow
        })
      }
    })

    const startupCompleted = await runStartup({
      steps: startupSteps,
      delayMs: STARTUP_STEP_DELAY_MS,
      publishStatus: setUpdateWindowStatus,
      onStepDone: (step) => {
        log.info(`${step.title} Done`)
      },
      onStepFailed: (step, error) => {
        log.error(`${step.title} Failed`, error)
      },
      doneTitle: 'Startup complete',
      doneDetail: 'Opening main window.'
    })

    if (!startupCompleted) {
      return
    }

    createMainAppWindow()

    app.on('activate', function () {
      if (mainWindow === null) {
        return
      }
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainAppWindow()
      }
    })

    globalShortcut.register('CommandOrControl+Shift+I', () => {
      if (mainWindow === null) {
        return
      }
      mainWindow.webContents.toggleDevTools()
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
}

const quit = async () => {
  isQuitting = true

  await statusWorker.destroy()
  await snapshotWorker.destroy()
  await worker.destroy()
  await node.destroy()
  await fsHandle.destroy()
  await settings.destroy()

  if (preventSleepId !== null) {
    powerSaveBlocker.stop(preventSleepId)
  }

  if (mainWindow !== null) {
    mainWindow.destroy()
  }
  if (updateWindow !== null) {
    updateWindow.destroy()
  }
  if (tray !== null) {
    tray.destroy()
    tray = null
  }

  globalShortcut.unregisterAll()
  app.quit()
  log.info('Quit')
}

const showExitConfirmation = () => {
  const options = {
    icon: icon,
    buttons: ['Yes', 'No'],
    defaultId: 1,
    title: 'Confirm',
    message: 'Do you really want to quit?',
    detail: 'Your application will be closed.'
  }
  dialog.showMessageBox(options).then(async (result) => {
    if (result.response === 0) {
      isQuitting = true
      await quit()
    }
  })
}
