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
import * as fs from 'node:fs'
import * as crypto from 'node:crypto'
import * as path from 'node:path'
import * as os from 'node:os'
import * as https from 'node:https'
import * as http from 'node:http'
import { URL } from 'node:url'
import log from 'electron-log/node'
import EventBus, { EventName, type Event, type BinaryDownloadProgressPayload } from './EventBus'

// Default directory where managed node binaries are stored
export const DEFAULT_WFBINS_DIR = path.join(os.homedir(), '.wf', 'bin_files')

// Active directory – can be overridden at runtime via setWfbinsDir()
let _wfbinsDir = DEFAULT_WFBINS_DIR

/** Returns the currently configured binaries directory */
export function getWfbinsDir(): string {
  return _wfbinsDir
}

/** Overrides the binaries directory (empty string resets to default) */
export function setWfbinsDir(dir: string): void {
  _wfbinsDir = dir || DEFAULT_WFBINS_DIR
}

// Base URL prepended to the per-file url from the manifest
const BINARY_BASE_URL = import.meta.env.MAIN_VITE_BIN_BASE_URL as string

// Remote manifest URL (env takes priority, falls back to BINARY_BASE_URL + latest.json)
const MANIFEST_URL = (import.meta.env.MAIN_VITE_BIN_MANIFEST_URL as string) || `${BINARY_BASE_URL}latest.json`

// The three mainnet binaries managed on all platforms (base names, without .exe)
export const BINARY_NAMES = [
  'coordinator-beacon-mainnet',
  'coordinator-validator-mainnet',
  'verifier-mainnet'
] as const

export type BinaryName = (typeof BINARY_NAMES)[number]

/**
 * Returns the actual filename for the current platform.
 * On Windows the executables carry a .exe suffix.
 */
export function getBinaryFilename(name: BinaryName): string {
  return process.platform === 'win32' ? `${name}.exe` : name
}

// Actual manifest shape:
// { version, files: { linux: { x64: Array<{ url, sha512, size }> }, mac: { x64: [...], arm64: [...] }, win: { x64: [...] } } }
interface ManifestEntry {
  url: string    // e.g. "0.25/linux/x64/coordinator-beacon-mainnet"
  sha512: string // SHA-512 hex digest
  size: string   // file size in bytes (as string)
}

interface LatestManifest {
  version: string
  files: {
    linux?: { x64?: ManifestEntry[] }
    mac?: { x64?: ManifestEntry[]; arm64?: ManifestEntry[] }
    win?: { x64?: ManifestEntry[] }
  }
}

/** Status of a single binary file */
export interface BinaryFileStatus {
  name: BinaryName
  /** Whether the file currently exists in getWfbinsDir() */
  exists: boolean
  /** Expected file size in bytes from the manifest (0 if manifest was unreachable) */
  size: number
}

/** Aggregated binary readiness status returned to the renderer */
export interface BinaryStatus {
  /** true when all three files exist in getWfbinsDir() */
  ready: boolean
  files: BinaryFileStatus[]
}

/** Per-file progress event emitted during downloadBinaries() */
export interface DownloadProgress {
  file: BinaryName
  phase: 'checking' | 'downloading' | 'verifying' | 'installed' | 'up_to_date'
  /** Bytes received so far (meaningful only during 'downloading') */
  received: number
  /** Total expected bytes (meaningful only during 'downloading') */
  total: number
}

/** Callback type for reporting startup-flow progress (string detail) */
export type BinUpdateProgress = (detail: string) => void

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Compute the SHA-512 hex digest of a file on disk */
function computeFileHash(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha512')
    const stream = fs.createReadStream(filePath)
    stream.on('data', (chunk) => hash.update(chunk))
    stream.on('end', () => resolve(hash.digest('hex')))
    stream.on('error', reject)
  })
}


/** Download a remote file to destPath, reporting byte-level progress via onProgress */
function downloadToFile(
  url: string,
  destPath: string,
  onProgress: (received: number, total: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url)
    const client = parsed.protocol === 'https:' ? https : http

    const req = client.get(url, (res) => {
      if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
        downloadToFile(res.headers.location, destPath, onProgress).then(resolve).catch(reject)
        return
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} downloading ${url}`))
        return
      }

      const total = parseInt(res.headers['content-length'] ?? '0', 10)
      let received = 0

      // Write to a temp file first to avoid leaving corrupt binaries on failure
      const tmpPath = `${destPath}.tmp`
      const fileStream = fs.createWriteStream(tmpPath)

      res.on('data', (chunk: Buffer) => {
        received += chunk.length
        fileStream.write(chunk)
        onProgress(received, total)
      })

      res.on('end', () => {
        fileStream.end()
        fileStream.on('close', () => {
          fs.rename(tmpPath, destPath, (err) => {
            if (err) {
              fs.unlink(tmpPath, () => {})
              reject(err)
            } else {
              resolve()
            }
          })
        })
        fileStream.on('error', (err) => {
          fs.unlink(tmpPath, () => {})
          reject(err)
        })
      })

      res.on('error', (err) => {
        fileStream.destroy()
        fs.unlink(tmpPath, () => {})
        reject(err)
      })
    })

    req.on('error', reject)
  })
}

/** Map Node.js process.platform to the manifest platform key */
function getManifestPlatformKey(): 'linux' | 'mac' | 'win' {
  switch (process.platform) {
    case 'darwin':
      return 'mac'
    case 'win32':
      return 'win'
    default:
      return 'linux'
  }
}

/** Map Node.js process.arch to the manifest architecture key */
function getManifestArchKey(): 'x64' | 'arm64' {
  return process.arch === 'arm64' ? 'arm64' : 'x64'
}

/**
 * Find a manifest entry whose url path ends with the actual binary filename
 * for the current platform (includes .exe on Windows).
 */
function findEntry(entries: ManifestEntry[], name: BinaryName): ManifestEntry | undefined {
  const filename = getBinaryFilename(name)
  return entries.find((e) => {
    const parts = e.url.split('/')
    return parts[parts.length - 1] === filename
  })
}

/** Fetch the manifest and return the entries array for the current platform/arch, or throw */
async function fetchEntries(): Promise<ManifestEntry[]> {
  const res = await fetch(MANIFEST_URL)
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching manifest`)
  const manifest = (await res.json()) as LatestManifest
  const plat = getManifestPlatformKey()
  const archKey = getManifestArchKey()
  const platFiles = manifest?.files?.[plat] as Record<string, ManifestEntry[]> | undefined
  const entries = platFiles?.[archKey]
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error(`Binary manifest is missing the files.${plat}.${archKey} array`)
  }
  return entries
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns the current binary readiness status for the renderer.
 * Tries to fetch the manifest to include expected file sizes; if the network
 * is unavailable the sizes are reported as 0 but existence is still checked.
 */
export async function getBinaryStatus(): Promise<BinaryStatus> {
  let entries: ManifestEntry[] = []
  try {
    entries = await fetchEntries()
  } catch (err) {
    log.warn('binUpdater:getStatus manifest fetch failed, reporting sizes as 0', err)
  }

  const files: BinaryFileStatus[] = BINARY_NAMES.map((name) => {
    const filePath = path.join(getWfbinsDir(), getBinaryFilename(name))
    const entry = findEntry(entries, name)
    return {
      name,
      exists: fs.existsSync(filePath),
      size: entry ? parseInt(entry.size, 10) : 0
    }
  })

  return {
    ready: files.every((f) => f.exists),
    files
  }
}

/**
 * Downloads missing or outdated binaries into getWfbinsDir() and reports granular
 * per-file progress via eventBus (BinaryDownloadProgress). Intended for on-demand
 * invocation from the renderer (node add / node start flows).
 *
 * Returns getWfbinsDir() on success; throws on unrecoverable errors.
 */
export async function downloadBinaries(eventBus: EventBus): Promise<string> {
  await fs.promises.mkdir(getWfbinsDir(), { recursive: true })

  const entries = await fetchEntries()

  for (const name of BINARY_NAMES) {
    const entry = findEntry(entries, name)
    if (!entry?.sha512 || !entry?.url) {
      throw new Error(`Manifest is missing a valid entry for binary "${name}"`)
    }

    const filePath = path.join(getWfbinsDir(), getBinaryFilename(name))

    // Check if already up-to-date
    eventBus.emitEvent(EventName.BinaryDownloadProgress, { file: name, phase: 'checking', received: 0, total: 0 })
    if (fs.existsSync(filePath)) {
      try {
        const hash = await computeFileHash(filePath)
        if (hash.toLowerCase() === entry.sha512.toLowerCase()) {
          log.info(`binUpdater: ${name} is up-to-date`)
          eventBus.emitEvent(EventName.BinaryDownloadProgress, { file: name, phase: 'up_to_date', received: 0, total: 0 })
          continue
        }
      } catch {
        // Hash failed — fall through to download
      }
    }

    // Download
    const downloadUrl = BINARY_BASE_URL + entry.url
    log.info(`binUpdater: downloading ${name} from ${downloadUrl}`)
    await downloadToFile(downloadUrl, filePath, (received, total) => {
      eventBus.emitEvent(EventName.BinaryDownloadProgress, { file: name, phase: 'downloading', received, total })
    })

    // Verify hash after download
    eventBus.emitEvent(EventName.BinaryDownloadProgress, { file: name, phase: 'verifying', received: 0, total: 0 })
    const actualHash = await computeFileHash(filePath)
    if (actualHash.toLowerCase() !== entry.sha512.toLowerCase()) {
      fs.unlinkSync(filePath)
      throw new Error(`SHA-512 hash mismatch for ${name} after download`)
    }

    // chmod +x is only meaningful on POSIX platforms
    if (process.platform !== 'win32') {
      fs.chmodSync(filePath, 0o755)
    }
    log.info(`binUpdater: ${name} installed`)
    eventBus.emitEvent(EventName.BinaryDownloadProgress, { file: name, phase: 'installed', received: 0, total: 0 })
  }

  log.info('binUpdater: downloadBinaries complete')
  return getWfbinsDir()
}

/**
 * Startup-flow entry point: ensures binaries are present and up-to-date.
 * Skipped when hasNodes is false.
 * Returns getWfbinsDir() on success or null if the step was skipped.
 */
export async function syncBinaries(
  hasNodes: boolean,
  onProgress: BinUpdateProgress,
  eventBus: EventBus
): Promise<string | null> {
  if (!hasNodes) {
    log.info('binUpdater: no nodes configured, skipping binary sync')
    return null
  }

  log.info('binUpdater: starting binary sync (startup)')
  onProgress('Checking node binaries…')

  const progressHandler = (e: Event<EventName.BinaryDownloadProgress, BinaryDownloadProgressPayload>) => {
    const { file, phase, received, total } = e.payload
    switch (phase) {
      case 'checking':
        onProgress(`Verifying ${file}…`)
        break
      case 'downloading':
        if (total > 0) {
          const pct = Math.round((received / total) * 100)
          const mb = (received / 1_048_576).toFixed(1)
          const totalMb = (total / 1_048_576).toFixed(1)
          onProgress(`Downloading ${file}: ${mb} / ${totalMb} MB (${pct}%)`)
        } else {
          onProgress(`Downloading ${file}: ${(received / 1_048_576).toFixed(1)} MB`)
        }
        break
      case 'verifying':
        onProgress(`Verifying downloaded ${file}…`)
        break
      case 'installed':
        onProgress(`${file} installed`)
        break
    }
  }

  eventBus.onEvent(EventName.BinaryDownloadProgress, progressHandler)
  try {
    await downloadBinaries(eventBus)
  } finally {
    eventBus.offEvent(EventName.BinaryDownloadProgress, progressHandler)
  }

  onProgress('Node binaries updated successfully')
  log.info('binUpdater: binary sync complete')
  return getWfbinsDir()
}
