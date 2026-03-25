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

import { BrowserWindow } from 'electron'

interface CreateUpdateWindowParams {
  icon: string
  preloadPath: string
  updateHtmlPath: string
  isDev: boolean
  rendererUrl?: string
  onDidFinishLoad?: () => void
  onClosed?: () => Promise<void> | void
}

export const createUpdateWindow = ({
  icon,
  preloadPath,
  updateHtmlPath,
  isDev,
  rendererUrl,
  onDidFinishLoad,
  onClosed
}: CreateUpdateWindowParams): BrowserWindow => {
  const window = new BrowserWindow({
    width: 560,
    height: 380,
    icon,
    center: true,
    title: '',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#00000000',
      symbolColor: '#eef6ff',
      height: 40
    },
    trafficLightPosition: { x: 10, y: 12 },
    autoHideMenuBar: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    backgroundColor: '#08152c',
    webPreferences: {
      preload: preloadPath,
      sandbox: false
    }
  })

  window.webContents.on('before-input-event', (_, input) => {
    const isCloseShortcut =
      input.type === 'keyDown' &&
      (input.key === 'Escape' || ((input.meta || input.control) && input.key.toLowerCase() === 'w'))
    if (isCloseShortcut) {
      window.close()
    }
  })

  window.webContents.on('did-finish-load', () => {
    onDidFinishLoad?.()
  })

  window.on('closed', () => {
    Promise.resolve(onClosed?.()).then(() => {})
  })

  if (isDev && rendererUrl) {
    window.loadURL(`${rendererUrl}/update.html`).then(() => {})
  } else {
    window.loadFile(updateHtmlPath).then(() => {})
  }

  return window
}
