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
import * as path from 'node:path'
import log from 'electron-log/node'
import AppEnv from './appEnv'
import NodeModel, { Type } from '../models/node'
import SettingsModel from '../models/settings'
import {
  copyFileReplace,
  checkOrCreateDir,
  computeFileSha512,
  createTempDir,
  downloadToFileAtomic,
  deleteFolderRecursive,
  fetchJSONFromUrl,
  fileExists,
  makeFileExecutableIfNeeded,
  deleteFile
} from './fs'
import {
  findManifestEntryByFilename,
  type LatestManifest,
  type ManifestEntry,
  resolveManifestEntries
} from './binaries/manifest'
import { MANAGED_BINARY_NAMES, type ManagedBinaryName } from './binaries/managed'
import { BinaryHashMismatchError, BinaryManifestError } from './binaries/errors'

export interface BinaryUpdateResult {
  dir: string
  version: string
  updated: boolean
}

export type BinUpdateProgress = (detail: string) => void

type ManifestData = {
  entries: ManifestEntry[]
  version: string
}

class BinUpdater {
  private appEnv: AppEnv
  private settingsModel: SettingsModel
  private nodeModel: NodeModel

  constructor(appEnv: AppEnv, settingsModel: SettingsModel, nodeModel: NodeModel) {
    this.appEnv = appEnv
    this.settingsModel = settingsModel
    this.nodeModel = nodeModel
  }

  private getBinariesDir(): string {
    return this.appEnv.getBinariesPath()
  }

  private getManifestPlatformKey(): 'linux' | 'mac' | 'win' {
    const platform = this.appEnv.getPlatform()
    if (!platform) {
      throw new BinaryManifestError('Unsupported platform for managed binaries')
    }
    return platform
  }

  private getManifestArchKey(): 'x64' | 'arm64' {
    const arch = this.appEnv.getArch()
    if (!arch) {
      throw new BinaryManifestError('Unsupported architecture for managed binaries')
    }
    return arch
  }

  private async loadManifestData(): Promise<ManifestData> {
    const manifestUrl = this.appEnv.getManagedBinaryManifestUrl()
    const manifest = await fetchJSONFromUrl<LatestManifest>(manifestUrl)
    const entries = resolveManifestEntries(
      manifest,
      this.getManifestPlatformKey(),
      this.getManifestArchKey()
    )
    return { entries, version: manifest.version ?? '' }
  }

  private async areManagedFilesPresent(): Promise<boolean> {
    const checks = await Promise.all(
      MANAGED_BINARY_NAMES.map((name) =>
        fileExists(path.join(this.getBinariesDir(), this.appEnv.getManagedBinaryFilename(name)))
      )
    )
    return checks.every(Boolean)
  }

  private async shouldUpdate(targetVersion: string): Promise<boolean> {
    const currentVersion = this.settingsModel.get()?.binariesVersion ?? ''
    const binariesReady = await this.areManagedFilesPresent()
    return !(targetVersion && currentVersion === targetVersion && binariesReady)
  }

  private async downloadAndVerifyOne(
    binaryName: ManagedBinaryName,
    entry: ManifestEntry,
    stagingDir: string,
    onProgress?: BinUpdateProgress
  ): Promise<void> {
    if (!entry.sha512 || !entry.url) {
      throw new BinaryManifestError(`Manifest is missing a valid entry for binary "${binaryName}"`)
    }

    const fileName = this.appEnv.getManagedBinaryFilename(binaryName)
    const filePath = path.join(stagingDir, fileName)
    const downloadUrl = `${this.appEnv.getManagedBinaryBaseUrl()}${entry.url}`
    const manifestSize = parseInt(entry.size, 10)
    let lastPercent = -1

    log.info(`binUpdater: downloading ${binaryName} from ${downloadUrl}`)
    await downloadToFileAtomic(downloadUrl, filePath, (received, total) => {
      const expectedTotal = total > 0 ? total : manifestSize
      if (expectedTotal > 0) {
        const percent = Math.min(100, Math.round((received / expectedTotal) * 100))
        if (percent !== lastPercent) {
          lastPercent = percent
          onProgress?.(`Downloading ${fileName}… ${percent}%`)
        }
        return
      }
      onProgress?.(`Downloading ${fileName}… ${(received / 1_048_576).toFixed(1)} MB`)
    })
    onProgress?.(`Verifying ${fileName}…`)

    const actualHash = await computeFileSha512(filePath)
    if (actualHash.toLowerCase() !== entry.sha512.toLowerCase()) {
      await deleteFile(filePath)
      throw new BinaryHashMismatchError(binaryName)
    }

    await makeFileExecutableIfNeeded(filePath)
    log.info(`binUpdater: ${binaryName} staged`)
  }

  private async installOneFromStaging(
    binaryName: ManagedBinaryName,
    stagingDir: string
  ): Promise<void> {
    const fileName = this.appEnv.getManagedBinaryFilename(binaryName)
    const sourcePath = path.join(stagingDir, fileName)
    const targetPath = path.join(this.getBinariesDir(), fileName)

    await copyFileReplace(sourcePath, targetPath)
    await makeFileExecutableIfNeeded(targetPath)
    log.info(`binUpdater: ${binaryName} installed`)
  }

  private persistVersion(version: string): void {
    if (version) {
      this.settingsModel.update({ binariesVersion: version })
    }
  }

  public async downloadBinaries(onProgress?: BinUpdateProgress): Promise<BinaryUpdateResult> {
    const binariesDir = this.getBinariesDir()
    if (!(await checkOrCreateDir(binariesDir))) {
      throw new Error(`Failed to prepare binaries directory: ${binariesDir}`)
    }

    const { entries, version } = await this.loadManifestData()

    if (!(await this.shouldUpdate(version))) {
      onProgress?.('Node binaries are up to date')
      log.info('binUpdater: binaries are up-to-date by manifest version', { version })
      return { dir: binariesDir, version, updated: false }
    }

    const stagingDir = await createTempDir('wf-binaries-')
    try {
      for (const name of MANAGED_BINARY_NAMES) {
        const fileName = this.appEnv.getManagedBinaryFilename(name)
        const entry = findManifestEntryByFilename(entries, fileName)
        if (!entry) {
          throw new BinaryManifestError(`Manifest is missing binary entry for ${fileName}`)
        }
        await this.downloadAndVerifyOne(name, entry, stagingDir, onProgress)
      }

      for (const name of MANAGED_BINARY_NAMES) {
        const fileName = this.appEnv.getManagedBinaryFilename(name)
        onProgress?.(`Installing ${fileName}…`)
        await this.installOneFromStaging(name, stagingDir)
      }
    } finally {
      await deleteFolderRecursive(stagingDir)
    }

    this.persistVersion(version)
    log.info('binUpdater: downloadBinaries complete')
    return { dir: binariesDir, version, updated: true }
  }

  public async syncBinaries(onProgress: BinUpdateProgress): Promise<BinaryUpdateResult | null> {
    if (!this.nodeModel.hasConfiguredNodesByType(Type.local)) {
      log.info('binUpdater: no local nodes configured, skipping binary sync')
      return null
    }

    log.info('binUpdater: starting binary sync (startup)')
    onProgress('Checking node binaries…')

    const result = await this.downloadBinaries(onProgress)
    onProgress(
      result.updated ? 'Node binaries updated successfully' : 'Node binaries are up to date'
    )

    log.info('binUpdater: binary sync complete')
    return result
  }
}

export default BinUpdater
