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
import log from 'electron-log/node'
import Database from 'better-sqlite3'

type Database = ReturnType<typeof Database>

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error)

export enum Theme {
  light = 'light',
  dark = 'dark',
  system = 'system'
}

export enum LogLevel {
  debug = 'debug',
  info = 'info',
  warn = 'warn',
  error = 'error'
}

interface SettingsRow {
  id: number
  theme: Theme
  autoStartApp: number
  autoStartNodes: number
  monitoringInterval: number
  logLevel: LogLevel
  createdAt: string
  updatedAt: string
}

export interface Settings {
  id: number
  theme: Theme
  autoStartApp: boolean
  autoStartNodes: boolean
  monitoringInterval: number
  logLevel: LogLevel
  createdAt: string
  updatedAt: string
}

export type UpdateSettings = Partial<
  Pick<Settings, 'theme' | 'autoStartApp' | 'autoStartNodes' | 'monitoringInterval' | 'logLevel'>
>

class SettingsModel {
  private db: Database | null = null

  constructor(db) {
    this.db = db
  }

  private mapRow(row: SettingsRow): Settings {
    return {
      ...row,
      autoStartApp: !!row.autoStartApp,
      autoStartNodes: !!row.autoStartNodes,
      logLevel: row.logLevel || LogLevel.debug
    }
  }

  private ensureRow(): void {
    if (!this.db) {
      return
    }

    this.db.prepare('INSERT OR IGNORE INTO settings (id) VALUES (1)').run()
  }

  get(): Settings | null {
    if (!this.db) {
      return null
    }

    const startedAt = Date.now()
    try {
      this.ensureRow()
      const row = this.db.prepare('SELECT * FROM settings WHERE id = 1').get() as
        | SettingsRow
        | undefined
      log.debug('settings-model:get', { found: !!row, durationMs: Date.now() - startedAt })
      return row ? this.mapRow(row) : null
    } catch (error) {
      log.error('settings-model:get-failed', {
        error: getErrorMessage(error),
        durationMs: Date.now() - startedAt
      })
      return null
    }
  }

  update(data: UpdateSettings): boolean {
    if (!this.db || Object.keys(data).length === 0) {
      return false
    }

    const updateData: Record<string, string | number> = {}

    if (data.theme !== undefined) {
      if (!Object.values(Theme).includes(data.theme)) {
        return false
      }
      updateData.theme = data.theme
    }

    if (data.autoStartApp !== undefined) {
      if (typeof data.autoStartApp !== 'boolean') {
        return false
      }
      updateData.autoStartApp = data.autoStartApp ? 1 : 0
    }

    if (data.autoStartNodes !== undefined) {
      if (typeof data.autoStartNodes !== 'boolean') {
        return false
      }
      updateData.autoStartNodes = data.autoStartNodes ? 1 : 0
    }

    if (data.monitoringInterval !== undefined) {
      if (
        !Number.isInteger(data.monitoringInterval) ||
        data.monitoringInterval < 5000 ||
        data.monitoringInterval > 60000
      ) {
        return false
      }
      updateData.monitoringInterval = data.monitoringInterval
    }

    if (data.logLevel !== undefined) {
      if (!Object.values(LogLevel).includes(data.logLevel)) {
        return false
      }
      updateData.logLevel = data.logLevel
    }

    const keys = Object.keys(updateData)
    if (keys.length === 0) {
      return false
    }

    const columns = keys.map((key) => `${key} = @${key}`).join(', ')

    try {
      const startedAt = Date.now()
      this.ensureRow()
      const query = this.db.prepare(`UPDATE settings SET ${columns} WHERE id = 1`)
      const res = query.run(updateData)
      log.debug('settings-model:update', {
        keys,
        changed: !!res.changes,
        durationMs: Date.now() - startedAt
      })
      return !!res.changes
    } catch (error) {
      log.error('settings-model:update-failed', {
        keys,
        error: getErrorMessage(error)
      })
      return false
    }
  }
}

export default SettingsModel
