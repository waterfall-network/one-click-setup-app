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
import { IpcMain, IpcMainInvokeEvent, app } from 'electron'
import { readFile, writeFile } from 'node:fs/promises'
import { getMain } from '../libs/db'
import AppEnv from '../libs/appEnv'
import EventBus, { EventName } from '../libs/EventBus'
import SettingsModel, { Settings as SettingsType, Theme, UpdateSettings } from '../models/settings'
import NodeModel from '../models/node'
import WorkerModel from '../models/worker'
import Database from 'better-sqlite3'

type Database = ReturnType<typeof Database>

interface ExportedConfig {
  version: 1
  exportedAt: string
  settings: SettingsType | null
  nodes: ReturnType<NodeModel['getAll']>
  workers: ReturnType<WorkerModel['getAll']>
}

interface ImportConfigPayload {
  version: number
  exportedAt: string
  settings: unknown
  nodes: unknown[]
  workers: unknown[]
}

interface ImportConfigResult {
  settings: SettingsType | null
  importedNodes: number
  importedWorkers: number
}

interface ExportConfigResult {
  saved: boolean
  exportedNodes: number
  exportedWorkers: number
}

class Settings {
  private ipcMain: IpcMain
  private appEnv: AppEnv
  private eventBus: EventBus
  private settingsModel: SettingsModel
  private nodeModel: NodeModel
  private workerModel: WorkerModel
  private db: Database

  private static readonly FACTORY_DEFAULT_SETTINGS: UpdateSettings = {
    theme: Theme.system,
    autoStartApp: true,
    autoStartNodes: true,
    monitoringInterval: 12000
  }

  constructor(ipcMain: IpcMain, appEnv: AppEnv, eventBus: EventBus) {
    this.ipcMain = ipcMain
    this.appEnv = appEnv
    this.eventBus = eventBus

    this.db = getMain(this.appEnv.mainDB)
    this.settingsModel = new SettingsModel(this.db)
    this.nodeModel = new NodeModel(this.db)
    this.workerModel = new WorkerModel(this.db)
  }

  public async initialize(): Promise<boolean> {
    this.ipcMain.handle('settings:get', () => this._get())
    this.ipcMain.handle('settings:update', (_event: IpcMainInvokeEvent, data) => this._update(data))
    this.ipcMain.handle('settings:exportConfig', (_event: IpcMainInvokeEvent, filePath) =>
      this._exportConfig(filePath)
    )
    this.ipcMain.handle('settings:importConfigFile', (_event: IpcMainInvokeEvent, filePath) =>
      this._importConfigFile(filePath)
    )
    this.ipcMain.handle('settings:resetFactory', () => this._resetFactory())

    const settings = this._get()
    if (settings) {
      this._setAutoStart(settings.autoStartApp)
    }

    return true
  }

  public async destroy() {
    this.ipcMain.removeHandler('settings:get')
    this.ipcMain.removeHandler('settings:update')
    this.ipcMain.removeHandler('settings:exportConfig')
    this.ipcMain.removeHandler('settings:importConfigFile')
    this.ipcMain.removeHandler('settings:resetFactory')
  }

  private _get(): SettingsType | null {
    return this.settingsModel.get()
  }

  private _update(data: unknown): SettingsType | null {
    const updateData = this._validateUpdateData(data)
    if (!updateData) {
      return this._get()
    }

    if (updateData.autoStartApp !== undefined) {
      this._setAutoStart(updateData.autoStartApp)
    }

    this.settingsModel.update(updateData)
    const settings = this.settingsModel.get()
    if (settings) {
      this.eventBus.emitEvent(EventName.SettingsUpdated, {
        theme: settings.theme,
        autoStartApp: settings.autoStartApp,
        autoStartNodes: settings.autoStartNodes,
        monitoringInterval: settings.monitoringInterval
      })
    }

    return settings
  }

  private _setAutoStart(enabled: boolean): void {
    app.setLoginItemSettings({ openAtLogin: enabled })
  }

  private async _exportConfig(filePath: unknown): Promise<ExportConfigResult> {
    if (typeof filePath !== 'string' || filePath.length === 0) {
      return {
        saved: false,
        exportedNodes: 0,
        exportedWorkers: 0
      }
    }

    const payload: ExportedConfig = {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: this.settingsModel.get(),
      nodes: this.nodeModel.getAll(),
      workers: this.workerModel.getAll()
    }

    try {
      await writeFile(filePath, JSON.stringify(payload, null, 2))
      return {
        saved: true,
        exportedNodes: payload.nodes.length,
        exportedWorkers: payload.workers.length
      }
    } catch {
      return {
        saved: false,
        exportedNodes: 0,
        exportedWorkers: 0
      }
    }
  }

  private _importConfig(data: unknown): ImportConfigResult {
    const payload = this._validateImportConfig(data)
    if (!payload) {
      return {
        settings: this._get(),
        importedNodes: 0,
        importedWorkers: 0
      }
    }

    const validatedSettings = this._validateImportSettings(payload.settings)
    if (!validatedSettings) {
      return {
        settings: this._get(),
        importedNodes: 0,
        importedWorkers: 0
      }
    }

    const imported = this._importNodesAndWorkers(payload)
    if (!imported) {
      return {
        settings: this._get(),
        importedNodes: 0,
        importedWorkers: 0
      }
    }

    return {
      settings: this._update(validatedSettings),
      importedNodes: imported.nodes,
      importedWorkers: imported.workers
    }
  }

  private async _importConfigFile(filePath: unknown): Promise<ImportConfigResult> {
    if (typeof filePath !== 'string' || filePath.length === 0) {
      return {
        settings: this._get(),
        importedNodes: 0,
        importedWorkers: 0
      }
    }

    try {
      const content = await readFile(filePath, { encoding: 'utf-8' })
      return this._importConfig(JSON.parse(content))
    } catch {
      return {
        settings: this._get(),
        importedNodes: 0,
        importedWorkers: 0
      }
    }
  }

  private _resetFactory(): SettingsType | null {
    try {
      const resetData = this.db.transaction(() => {
        if (!this.workerModel.clearAll()) {
          throw new Error('Failed to clear workers')
        }
        if (!this.nodeModel.clearAll()) {
          throw new Error('Failed to clear nodes')
        }
      })
      resetData()
      this.settingsModel.update(Settings.FACTORY_DEFAULT_SETTINGS)
      this._setAutoStart(Settings.FACTORY_DEFAULT_SETTINGS.autoStartApp || false)
      const settings = this.settingsModel.get()
      if (settings) {
        this.eventBus.emitEvent(EventName.SettingsUpdated, {
          theme: settings.theme,
          autoStartApp: settings.autoStartApp,
          autoStartNodes: settings.autoStartNodes,
          monitoringInterval: settings.monitoringInterval
        })
      }
      return settings
    } catch {
      return null
    }
  }

  private _validateUpdateData(data: unknown): UpdateSettings | null {
    if (!data || typeof data !== 'object') {
      return null
    }

    const payload = data as Record<string, unknown>
    const validated: UpdateSettings = {}

    if (payload.theme !== undefined) {
      if (
        payload.theme !== Theme.light &&
        payload.theme !== Theme.dark &&
        payload.theme !== Theme.system
      ) {
        return null
      }
      validated.theme = payload.theme
    }

    if (payload.autoStartApp !== undefined) {
      if (typeof payload.autoStartApp !== 'boolean') {
        return null
      }
      validated.autoStartApp = payload.autoStartApp
    }

    if (payload.autoStartNodes !== undefined) {
      if (typeof payload.autoStartNodes !== 'boolean') {
        return null
      }
      validated.autoStartNodes = payload.autoStartNodes
    }

    if (payload.monitoringInterval !== undefined) {
      const monitoringInterval = payload.monitoringInterval
      if (
        typeof monitoringInterval !== 'number' ||
        !Number.isInteger(monitoringInterval) ||
        monitoringInterval < 5000 ||
        monitoringInterval > 60000
      ) {
        return null
      }
      validated.monitoringInterval = monitoringInterval
    }

    if (Object.keys(validated).length === 0) {
      return null
    }

    return validated
  }

  private _validateImportConfig(data: unknown): ImportConfigPayload | null {
    if (!data || typeof data !== 'object') {
      return null
    }

    const payload = data as Record<string, unknown>
    if (payload.version !== 1) {
      return null
    }

    if (typeof payload.exportedAt !== 'string' || Number.isNaN(Date.parse(payload.exportedAt))) {
      return null
    }

    if (!Array.isArray(payload.nodes) || !Array.isArray(payload.workers)) {
      return null
    }

    // Validate node/worker entries shape to ensure imported backup is structurally correct.
    if (!payload.nodes.every((node) => this._isValidImportedNode(node))) {
      return null
    }
    if (!payload.workers.every((worker) => this._isValidImportedWorker(worker))) {
      return null
    }

    if (!payload.settings || typeof payload.settings !== 'object') {
      return null
    }

    return {
      version: payload.version,
      exportedAt: payload.exportedAt,
      settings: payload.settings,
      nodes: payload.nodes,
      workers: payload.workers
    }
  }

  private _validateImportSettings(data: unknown): UpdateSettings | null {
    if (!data || typeof data !== 'object') {
      return null
    }

    const settings = data as Record<string, unknown>
    if (
      settings.theme === undefined ||
      settings.autoStartApp === undefined ||
      settings.autoStartNodes === undefined ||
      settings.monitoringInterval === undefined
    ) {
      return null
    }

    return this._validateUpdateData({
      theme: settings.theme,
      autoStartApp: settings.autoStartApp,
      autoStartNodes: settings.autoStartNodes,
      monitoringInterval: settings.monitoringInterval
    })
  }

  private _isValidImportedNode(data: unknown): boolean {
    if (!data || typeof data !== 'object') {
      return false
    }

    const node = data as Record<string, unknown>
    return (
      typeof node.id === 'number' &&
      typeof node.name === 'string' &&
      typeof node.network === 'string' &&
      typeof node.type === 'string' &&
      typeof node.locationDir === 'string'
    )
  }

  private _isValidImportedWorker(data: unknown): boolean {
    if (!data || typeof data !== 'object') {
      return false
    }

    const worker = data as Record<string, unknown>
    return (
      typeof worker.id === 'number' &&
      typeof worker.nodeId === 'number' &&
      typeof worker.coordinatorPublicKey === 'string' &&
      typeof worker.validatorAddress === 'string'
    )
  }

  private _importNodesAndWorkers(
    payload: ImportConfigPayload
  ): { nodes: number; workers: number } | null {
    try {
      const nodes = payload.nodes as Record<string, unknown>[]
      const workers = payload.workers as Record<string, unknown>[]
      const nodeIds = new Set<number>(nodes.map((n) => n.id as number))
      if (!workers.every((worker) => nodeIds.has(worker.nodeId as number))) {
        return null
      }

      const importData = this.db.transaction(() => {
        if (!this.workerModel.clearAll()) {
          throw new Error('Failed to clear workers')
        }
        if (!this.nodeModel.clearAll()) {
          throw new Error('Failed to clear nodes')
        }
        if (!this.nodeModel.insertManyForImport(nodes)) {
          throw new Error('Failed to import nodes')
        }
        if (!this.workerModel.insertManyForImport(workers)) {
          throw new Error('Failed to import workers')
        }
        if (!this.nodeModel.syncWorkersCount()) {
          throw new Error('Failed to sync workers count')
        }
      })

      importData()
      return {
        nodes: payload.nodes.length,
        workers: payload.workers.length
      }
    } catch {
      return null
    }
  }
}

export default Settings
