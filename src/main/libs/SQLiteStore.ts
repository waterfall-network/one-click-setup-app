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
import { app } from 'electron'
import Database from 'better-sqlite3'
import { FileStore, MigrationSet, FileStoreLoadCallback, Migration } from 'migrate'
import path from 'path'
import log from 'electron-log/node'
import { getMain } from './db'

type Database = ReturnType<typeof Database>
type Callback = (result: Error | null) => void
type migration = Pick<Migration, 'title' | 'description' | 'timestamp'>

export class SQLiteStore implements FileStore {
  private db: Database

  constructor() {
    const dbPath = path.join(app.getPath('userData'), 'wf.db')
    this.db = getMain(dbPath)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        timestamp INTEGER
      )
    `)
  }

  load(cb: FileStoreLoadCallback): void {
    try {
      const migrations = this.db
        .prepare('SELECT * FROM migrations ORDER BY id ASC')
        .all() as migration[]
      if (migrations.length === 0) {
        return cb(null, { migrations })
      }

      const state = {
        lastRun: migrations[migrations.length - 1].title,
        migrations
      }
      state.migrations.forEach((m) => log.debug('load-migration', m.title))

      cb(null, state)
    } catch (err) {
      cb(err as Error)
    }
  }

  save(set: MigrationSet, cb: Callback): void {
    try {
      if (!set.lastRun) return cb(null)
      const migration = set.map[set.lastRun]
      const insert = this.db.prepare('INSERT INTO migrations (title, timestamp) VALUES (?, ?)')
      insert.run(migration.title, migration.timestamp)
      log.debug('save-migration', migration.title)
      cb(null)
    } catch (err) {
      cb(err as Error)
    }
  }
}
