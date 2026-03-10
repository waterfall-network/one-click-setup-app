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
import path from 'path'
import { app } from 'electron'
import { getMain } from '../libs/db'

const dbPath = path.join(app.getPath('userData'), 'wf.db')
const db = getMain(dbPath)
export function up(next: () => void): void {
  db.exec(`
    CREATE TABLE nodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      network TEXT NOT NULL DEFAULT 'mainnet',
      type TEXT NOT NULL DEFAULT 'local',
      locationDir TEXT NOT NULL,
      coordinatorStatus TEXT NOT NULL DEFAULT 'stopped',
      coordinatorPeersCount INTEGER NOT NULL DEFAULT 0,
      coordinatorHeadSlot INTEGER NOT NULL DEFAULT 0,
      coordinatorSyncDistance INTEGER NOT NULL DEFAULT 0,
      coordinatorPreviousJustifiedEpoch INTEGER NOT NULL DEFAULT 0,
      coordinatorCurrentJustifiedEpoch INTEGER NOT NULL DEFAULT 0,
      coordinatorFinalizedEpoch INTEGER NOT NULL DEFAULT 0,
      coordinatorHttpApiPort INTEGER NOT NULL,
      coordinatorHttpValidatorApiPort INTEGER NOT NULL,
      coordinatorP2PTcpPort INTEGER NOT NULL,
      coordinatorP2PUdpPort INTEGER NOT NULL,
      coordinatorPid INTEGER,
      coordinatorValidatorStatus TEXT NOT NULL DEFAULT 'stopped',
      coordinatorValidatorPid INTEGER,
      validatorStatus TEXT NOT NULL DEFAULT 'stopped',
      validatorPeersCount INTEGER NOT NULL DEFAULT 0,
      validatorHeadSlot INTEGER NOT NULL DEFAULT 0,
      validatorSyncDistance INTEGER NOT NULL DEFAULT 0,
      validatorFinalizedSlot INTEGER NOT NULL DEFAULT 0,
      validatorP2PPort INTEGER NOT NULL,
      validatorHttpApiPort INTEGER NOT NULL,
      validatorWsApiPort INTEGER NOT NULL,
      validatorPid INTEGER,
      workersCount INTEGER NOT NULL DEFAULT 0,
      memoHash TEXT,
      createdAt DATETIME NOT NULL DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW')),
      updatedAt DATETIME NOT NULL DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW'))
    );
    CREATE TRIGGER update_nodes_trigger
    AFTER UPDATE ON nodes
    BEGIN
      UPDATE nodes SET updatedAt = STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW') WHERE id = NEW.id;
    END;
  `)
  next()
}
export function down(next: () => void): void {
  db.exec(`
    DROP TRIGGER IF EXISTS update_nodes_trigger;
    DROP TABLE nodes;
  `)
  next()
}
