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
import { IpcMain, IpcMainInvokeEvent, app } from 'electron'
import { setWfbinsDir } from '../libs/binUpdater'
import { copyFile, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import log from 'electron-log/node'
import logMain from 'electron-log/main'
import { getMain } from '../libs/db'
import AppEnv from '../libs/appEnv'
import EventBus, { EventName } from '../libs/EventBus'
import SettingsModel, {
  LogLevel,
  Settings as SettingsType,
  Theme,
  UpdateSettings
} from '../models/settings'
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

interface ExportMainLogResult {
  saved: boolean
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
    monitoringInterval: 12000,
    logLevel: LogLevel.debug,
    binariesPath: ''
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
    this.ipcMain.handle('settings:exportMainLog', (_event: IpcMainInvokeEvent, filePath) =>
      this._exportMainLog(filePath)
    )
    this.ipcMain.handle('settings:resetFactory', () => this._resetFactory())

    const settings = this._get()
    if (settings) {
      this._setAutoStart(settings.autoStartApp)
      this._setLogLevel(settings.logLevel)
      setWfbinsDir(settings.binariesPath)
    }

    return true
  }

  public async destroy() {
    this.ipcMain.removeHandler('settings:get')
    this.ipcMain.removeHandler('settings:update')
    this.ipcMain.removeHandler('settings:exportConfig')
    this.ipcMain.removeHandler('settings:importConfigFile')
    this.ipcMain.removeHandler('settings:exportMainLog')
    this.ipcMain.removeHandler('settings:resetFactory')
  }

  private _get(): SettingsType | null {
    return this.settingsModel.get()
  }

  private _update(data: unknown): SettingsType | null {
    const startedAt = Date.now()
    const updateData = this._validateUpdateData(data)
    if (!updateData) {
      log.warn('settings:update-invalid-payload')
      return this._get()
    }

    const updated = this.settingsModel.update(updateData)
    if (!updated) {
      log.error('settings:update-db-failed', { keys: Object.keys(updateData) })
      return this._get()
    }

    if (updateData.autoStartApp !== undefined) {
      this._setAutoStart(updateData.autoStartApp)
    }
    if (updateData.logLevel !== undefined) {
      this._setLogLevel(updateData.logLevel)
    }
    if (updateData.binariesPath !== undefined) {
      setWfbinsDir(updateData.binariesPath)
    }

    const settings = this.settingsModel.get()
    log.info('settings:update-applied', {
      keys: Object.keys(updateData),
      durationMs: Date.now() - startedAt
    })
    if (settings) {
      const effectiveSettings = {
        ...settings,
        ...updateData
      }
      this.eventBus.emitEvent(EventName.SettingsUpdated, {
        theme: effectiveSettings.theme,
        autoStartApp: effectiveSettings.autoStartApp,
        autoStartNodes: effectiveSettings.autoStartNodes,
        monitoringInterval: effectiveSettings.monitoringInterval,
        logLevel: effectiveSettings.logLevel
      })
    }

    return settings
  }

  private _setAutoStart(enabled: boolean): void {
    app.setLoginItemSettings({ openAtLogin: enabled })
    log.info('settings:auto-start-updated', { enabled })
  }

  private _setLogLevel(level: LogLevel): void {
    log.transports.file.level = level
    logMain.transports.file.level = level
    log.info('settings:log-level-updated', { level })
  }

  private async _exportConfig(filePath: unknown): Promise<ExportConfigResult> {
    const startedAt = Date.now()
    if (typeof filePath !== 'string' || filePath.length === 0) {
      log.warn('settings:export-config-invalid-path')
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
      log.info('settings:export-config-success', {
        exportedNodes: payload.nodes.length,
        exportedWorkers: payload.workers.length,
        durationMs: Date.now() - startedAt
      })
      return {
        saved: true,
        exportedNodes: payload.nodes.length,
        exportedWorkers: payload.workers.length
      }
    } catch {
      log.error('settings:export-config-failed', { durationMs: Date.now() - startedAt })
      return {
        saved: false,
        exportedNodes: 0,
        exportedWorkers: 0
      }
    }
  }

  private async _exportMainLog(filePath: unknown): Promise<ExportMainLogResult> {
    const startedAt = Date.now()
    if (typeof filePath !== 'string' || filePath.length === 0) {
      log.warn('settings:export-main-log-invalid-path')
      return { saved: false }
    }

    try {
      const sourceLogPath = path.join(app.getPath('logs'), 'main.log')
      await copyFile(sourceLogPath, filePath)
      log.info('settings:export-main-log-success', {
        durationMs: Date.now() - startedAt
      })
      return { saved: true }
    } catch (error) {
      log.error('settings:export-main-log-failed', {
        durationMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : String(error)
      })
      return { saved: false }
    }
  }

  private _importConfig(data: unknown): ImportConfigResult {
    const startedAt = Date.now()
    const payload = this._validateImportConfig(data)
    if (!payload) {
      log.warn('settings:import-config-invalid-payload')
      return {
        settings: this._get(),
        importedNodes: 0,
        importedWorkers: 0
      }
    }

    const validatedSettings = this._validateImportSettings(payload.settings)
    if (!validatedSettings) {
      log.warn('settings:import-config-invalid-settings')
      return {
        settings: this._get(),
        importedNodes: 0,
        importedWorkers: 0
      }
    }

    const imported = this._importNodesAndWorkers(payload)
    if (!imported) {
      log.error('settings:import-config-import-failed')
      return {
        settings: this._get(),
        importedNodes: 0,
        importedWorkers: 0
      }
    }

    log.info('settings:import-config-success', {
      importedNodes: imported.nodes,
      importedWorkers: imported.workers,
      durationMs: Date.now() - startedAt
    })
    return {
      settings: this._update(validatedSettings),
      importedNodes: imported.nodes,
      importedWorkers: imported.workers
    }
  }

  private async _importConfigFile(filePath: unknown): Promise<ImportConfigResult> {
    const startedAt = Date.now()
    if (typeof filePath !== 'string' || filePath.length === 0) {
      log.warn('settings:import-config-file-invalid-path')
      return {
        settings: this._get(),
        importedNodes: 0,
        importedWorkers: 0
      }
    }

    try {
      const content = await readFile(filePath, { encoding: 'utf-8' })
      log.debug('settings:import-config-file-read', { durationMs: Date.now() - startedAt })
      return this._importConfig(JSON.parse(content))
    } catch {
      log.error('settings:import-config-file-failed', { durationMs: Date.now() - startedAt })
      return {
        settings: this._get(),
        importedNodes: 0,
        importedWorkers: 0
      }
    }
  }

  private _resetFactory(): SettingsType | null {
    const startedAt = Date.now()
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
          monitoringInterval: settings.monitoringInterval,
          logLevel: settings.logLevel
        })
      }
      log.info('settings:reset-factory-success', { durationMs: Date.now() - startedAt })
      return settings
    } catch {
      log.error('settings:reset-factory-failed', { durationMs: Date.now() - startedAt })
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

    if (payload.logLevel !== undefined) {
      if (
        payload.logLevel !== LogLevel.debug &&
        payload.logLevel !== LogLevel.info &&
        payload.logLevel !== LogLevel.warn &&
        payload.logLevel !== LogLevel.error
      ) {
        return null
      }
      validated.logLevel = payload.logLevel
    }

    if (payload.binariesPath !== undefined) {
      if (typeof payload.binariesPath !== 'string') {
        return null
      }
      validated.binariesPath = payload.binariesPath
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
      monitoringInterval: settings.monitoringInterval,
      logLevel: settings.logLevel ?? LogLevel.debug
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
