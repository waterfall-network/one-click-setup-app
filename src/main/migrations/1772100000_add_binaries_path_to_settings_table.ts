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
import path from 'path'
import { app } from 'electron'
import { getMain } from '../libs/db'

const dbPath = path.join(app.getPath('userData'), 'wf.db')
const db = getMain(dbPath)

export function up(next: () => void): void {
  db.exec(`
    ALTER TABLE settings
    ADD COLUMN binariesPath TEXT NOT NULL DEFAULT '';
  `)

  next()
}

export function down(next: () => void): void {
  db.exec(`
    DROP TRIGGER IF EXISTS update_settings_trigger;

    CREATE TABLE settings_old (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
      autoStartApp INTEGER NOT NULL DEFAULT 1,
      autoStartNodes INTEGER NOT NULL DEFAULT 1,
      monitoringInterval INTEGER NOT NULL DEFAULT 12000,
      logLevel TEXT NOT NULL DEFAULT 'debug',
      createdAt DATETIME NOT NULL DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW')),
      updatedAt DATETIME NOT NULL DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW'))
    );

    INSERT INTO settings_old (
      id, theme, autoStartApp, autoStartNodes, monitoringInterval, logLevel, createdAt, updatedAt
    )
    SELECT
      id, theme, autoStartApp, autoStartNodes, monitoringInterval, logLevel, createdAt, updatedAt
    FROM settings;

    DROP TABLE settings;
    ALTER TABLE settings_old RENAME TO settings;

    CREATE TRIGGER update_settings_trigger
    AFTER UPDATE ON settings
    BEGIN
      UPDATE settings SET updatedAt = STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW') WHERE id = NEW.id;
    END;
  `)

  next()
}
