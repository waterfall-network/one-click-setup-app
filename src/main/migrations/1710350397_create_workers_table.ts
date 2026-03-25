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
    CREATE TABLE workers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nodeId INTEGER,
      number INTEGER NOT NULL DEFAULT 0,
      coordinatorStatus TEXT NOT NULL DEFAULT 'pending_initialized',
      coordinatorPublicKey TEXT NOT NULL,
      coordinatorBalanceAmount TEXT NOT NULL DEFAULT '0',
      coordinatorActivationEpoch TEXT NOT NULL DEFAULT '',
      coordinatorDeActivationEpoch TEXT NOT NULL DEFAULT '',
      coordinatorBlockCreationCount INTEGER NOT NULL DEFAULT 0,
      coordinatorAttestationCreationCount INTEGER NOT NULL DEFAULT 0,
      validatorStatus TEXT NOT NULL DEFAULT 'pending_initialized',
      validatorAddress TEXT NOT NULL,
      validatorBalanceAmount TEXT NOT NULL DEFAULT '0',
      validatorActivationEpoch TEXT NOT NULL DEFAULT '',
      validatorDeActivationEpoch TEXT NOT NULL DEFAULT '',
      validatorBlockCreationCount INTEGER NOT NULL DEFAULT 0,
      withdrawalAddress TEXT NOT NULL,
      signature TEXT NOT NULL,
      stakeAmount TEXT NOT NULL DEFAULT '0',
      createdAt DATETIME NOT NULL DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW')),
      updatedAt DATETIME NOT NULL DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW')),
      CONSTRAINT fkNode FOREIGN KEY (nodeId) REFERENCES nodes(id) ON DELETE SET NULL ON UPDATE CASCADE
    );
    CREATE TRIGGER update_workers_trigger
    AFTER UPDATE ON workers
    BEGIN
      UPDATE workers SET updatedAt = STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW') WHERE id = NEW.id;
    END;
    CREATE TRIGGER update_workers_number_trigger
    AFTER INSERT ON workers
    BEGIN
      UPDATE workers SET number = (SELECT COUNT(*) FROM workers WHERE nodeId = NEW.nodeId) - 1 WHERE id = NEW.id;
      UPDATE nodes SET workersCount = workersCount + 1 WHERE id = NEW.nodeId;
    END;
  `)
  next()
}
export function down(next: () => void): void {
  db.exec(`
    DROP TRIGGER IF EXISTS update_workers_trigger;
    DROP TRIGGER IF EXISTS update_workers_number_trigger;
    DROP TABLE workers;
  `)
  next()
}
