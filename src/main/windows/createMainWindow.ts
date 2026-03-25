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

import { BrowserWindow, Event, HandlerDetails, shell } from 'electron'

interface CreateMainWindowParams {
  icon: string
  preloadPath: string
  indexHtmlPath: string
  isDev: boolean
  rendererUrl?: string
  onReadyToShow?: () => void
  onCloseRequest?: (event: Event, window: BrowserWindow) => void
}

export const createMainWindow = ({
  icon,
  preloadPath,
  indexHtmlPath,
  isDev,
  rendererUrl,
  onReadyToShow,
  onCloseRequest
}: CreateMainWindowParams): BrowserWindow => {
  const window = new BrowserWindow({
    width: 1200,
    height: 900,
    show: false,
    autoHideMenuBar: true,
    icon,
    center: true,
    title: 'Waterfall',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#00000000',
      symbolColor: '#fff',
      height: 40
    },
    trafficLightPosition: { x: 10, y: 12 },
    webPreferences: {
      preload: preloadPath,
      sandbox: false
    }
  })

  window.on('ready-to-show', () => {
    onReadyToShow?.()
    window.show()
  })

  window.on('close', (event: Event) => {
    onCloseRequest?.(event, window)
  })

  window.webContents.setWindowOpenHandler((details: HandlerDetails) => {
    shell.openExternal(details.url).then(() => {
      return { action: 'deny' }
    })
    return { action: 'deny' }
  })

  if (isDev && rendererUrl) {
    window.loadURL(`${rendererUrl}/index.html`).then(() => {})
  } else {
    window.loadFile(indexHtmlPath).then(() => {})
  }

  return window
}
