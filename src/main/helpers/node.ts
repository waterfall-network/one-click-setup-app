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
export interface WatInfo {
  cpSlot: number
  currSlot: number
  maxDagSlot: number
}

export function isWatInfo(value: any): value is WatInfo {
  return (
    value &&
    typeof value === 'object' &&
    'cpSlot' in value &&
    'currSlot' in value &&
    'maxDagSlot' in value
  )
}

export interface SyncInfo {
  currentSlot: number
  finalizedSlot: number
}

export function isSyncInfo(value: any): value is SyncInfo {
  return value && typeof value === 'object' && 'currentSlot' in value && 'finalizedSlot' in value
}
