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
import { IpcMain, dialog, shell, IpcMainInvokeEvent } from 'electron'
import { writeFile } from 'node:fs/promises'

type FileFilter = { name: string; extensions: string[] }

class FsHandle {
  private ipcMain: IpcMain

  constructor(ipcMain: IpcMain) {
    this.ipcMain = ipcMain
  }

  public initialize() {
    this.ipcMain.handle('os:selectDirectory', (_event: IpcMainInvokeEvent, defaultPath) =>
      this._selectDirectory(defaultPath)
    )
    this.ipcMain.handle('os:selectFile', (_event: IpcMainInvokeEvent, defaultPath, filters) =>
      this._selectFile(defaultPath, filters)
    )
    this.ipcMain.handle(
      'os:selectSavePath',
      (_event: IpcMainInvokeEvent, title, fileName, filters?: FileFilter[]) =>
        this._selectSavePath(title, fileName, filters)
    )
    this.ipcMain.handle(
      'os:saveTextFile',
      (_event: IpcMainInvokeEvent, text, title, fileName, filters?: FileFilter[]) =>
        this._saveTextFile(text, title, fileName, filters)
    )
    this.ipcMain.handle('os:openExternal', (_event: IpcMainInvokeEvent, url) =>
      this._openExternal(url)
    )
  }

  public async destroy() {
    this.ipcMain.removeHandler('os:selectDirectory')
    this.ipcMain.removeHandler('os:selectFile')
    this.ipcMain.removeHandler('os:selectSavePath')
    this.ipcMain.removeHandler('os:saveTextFile')
    this.ipcMain.removeHandler('os:openUrl')
  }

  private async _openExternal(url: string): Promise<void> {
    return await shell.openExternal(url)
  }

  private async _selectDirectory(defaultPath?: string): Promise<string | null> {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      defaultPath,
      properties: ['openDirectory', 'createDirectory', 'promptToCreate']
    })
    if (canceled) {
      return null
    } else {
      return filePaths[0]
    }
  }
  private async _selectFile(
    defaultPath?: string,
    filters?: { name: string; extensions: string[] }[]
  ): Promise<string | null> {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      defaultPath,
      filters,
      properties: ['openFile']
    })
    if (canceled) {
      return null
    } else {
      return filePaths[0]
    }
  }
  private async _saveTextFile(
    text: string,
    title?: string,
    fileName?: string,
    filters?: FileFilter[]
  ): Promise<boolean> {
    try {
      const { filePath } = await dialog.showSaveDialog({
        defaultPath: fileName,
        title: title || 'Save text file',
        filters:
          filters && filters.length > 0 ? filters : [{ name: 'Text Files', extensions: ['txt'] }]
      })
      if (filePath) {
        await writeFile(filePath, text)
        return true
      }
    } catch {
      return false
    }
    return false
  }

  private async _selectSavePath(
    title?: string,
    fileName?: string,
    filters?: FileFilter[]
  ): Promise<string | null> {
    const { filePath } = await dialog.showSaveDialog({
      defaultPath: fileName,
      title: title || 'Save file',
      filters:
        filters && filters.length > 0 ? filters : [{ name: 'Text Files', extensions: ['txt'] }]
    })
    return filePath || null
  }
}

export default FsHandle
