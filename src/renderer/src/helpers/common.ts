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
export const isWindows = window?.os?.platform === 'win'
export const isMac = window?.os?.platform === 'mac'

export const shuffleArray = (array: any[]) => {
  return array
    .map((value, index) => ({ value, sort: Math.random(), index }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value, index }) => ({ value, index }))
}

export const isAddress = (address: string): boolean => {
  return /^(0x)?[0-9a-fA-F]{40}$/.test(address)
}

export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export const chunkArray = (
  array: (number | bigint)[],
  chunkSize: number
): (number | bigint)[][] => {
  const result: (number | bigint)[][] = []
  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize)
    result.push(chunk)
  }
  return result
}
