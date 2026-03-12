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

import { BrowserWindow, IpcMain, Menu, Tray } from 'electron'

interface InitializeTrayAndHandlersParams {
  trayIcon: string
  ipcMain: IpcMain
  appVersion: string
  checkForUpdates: () => void
  quit: () => Promise<void>
  getMainWindow: () => BrowserWindow | null
}

export const initializeTrayAndHandlers = ({
  trayIcon,
  ipcMain,
  appVersion,
  checkForUpdates,
  quit,
  getMainWindow
}: InitializeTrayAndHandlersParams): Tray => {
  const tray = new Tray(trayIcon)
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: (): void => {
        const mainWindow = getMainWindow()
        if (mainWindow === null) {
          return
        }
        mainWindow.show()
      }
    },
    {
      label: 'Check Updates',
      click: (): void => {
        checkForUpdates()
      }
    },
    {
      label: 'Quit',
      click: async () => {
        await quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)
  tray.setToolTip('Waterfall')
  ipcMain.handle('app:quit', async () => await quit())
  ipcMain.handle('app:state', async () => ({
    version: appVersion
  }))

  return tray
}
