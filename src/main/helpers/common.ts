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
export function areObjectsEqual(obj1: object, obj2: object) {
  const keys1 = Object.keys(obj1)
  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false
    }
  }
  return true
}

export function getCurrentDateUTC(withMilliseconds = false) {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  const day = String(now.getUTCDate()).padStart(2, '0')
  const hours = String(now.getUTCHours()).padStart(2, '0')
  const minutes = String(now.getUTCMinutes()).padStart(2, '0')
  const seconds = String(now.getUTCSeconds()).padStart(2, '0')
  const milliseconds = String(now.getUTCMilliseconds()).padStart(3, '0')
  const nanosecondsZeros = '000000'
  if (withMilliseconds) {
    return `${year}-${month}-${day}T${hours}-${minutes}-${seconds}.${milliseconds}${nanosecondsZeros}Z`
  }
  return `${year}-${month}-${day}T${hours}-${minutes}-${seconds}Z`
}

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
