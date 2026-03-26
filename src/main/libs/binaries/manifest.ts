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

import { BinaryManifestError } from './errors'

export interface ManifestEntry {
  url: string
  sha512: string
  size: string
}

export interface LatestManifest {
  version: string
  files: {
    linux?: { x64?: ManifestEntry[] }
    mac?: { x64?: ManifestEntry[]; arm64?: ManifestEntry[] }
    win?: { x64?: ManifestEntry[] }
  }
}

export const resolveManifestEntries = (
  manifest: LatestManifest,
  platform: 'linux' | 'mac' | 'win',
  arch: 'x64' | 'arm64'
): ManifestEntry[] => {
  const platformFiles = manifest?.files?.[platform] as Record<string, ManifestEntry[]> | undefined
  const entries = platformFiles?.[arch]
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new BinaryManifestError(`Binary manifest is missing the files.${platform}.${arch} array`)
  }
  return entries
}

export const findManifestEntryByFilename = (
  entries: ManifestEntry[],
  filename: string
): ManifestEntry | undefined => {
  return entries.find((entry) => {
    const parts = entry.url.split('/')
    return parts[parts.length - 1] === filename
  })
}
