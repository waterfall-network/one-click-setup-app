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
    DROP TRIGGER IF EXISTS update_workers_number_trigger;
    CREATE TRIGGER update_workers_number_trigger
    AFTER INSERT ON workers
    BEGIN
      UPDATE workers SET number = (SELECT workersCount FROM nodes WHERE id = NEW.nodeId) WHERE id = NEW.id;
      UPDATE nodes SET workersCount = workersCount + 1 WHERE id = NEW.nodeId;
    END;
  `)
  next()
}
export function down(next: () => void): void {
  db.exec(`
    DROP TRIGGER IF EXISTS update_workers_number_trigger;
  `)
  next()
}
