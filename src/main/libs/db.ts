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
import Database from 'better-sqlite3'

type Database = ReturnType<typeof Database>
export const getMain = (dbPath: string): Database => {
  const db = new Database(dbPath)
  db.pragma('busy_timeout = 5000')
  db.pragma('foreign_keys = ON')
  return db
}
