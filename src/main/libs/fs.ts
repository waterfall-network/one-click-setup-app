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
import {
  access,
  mkdir,
  writeFile,
  readFile,
  readdir,
  appendFile,
  rm,
  unlink,
  rename,
  copyFile,
  mkdtemp,
  chmod,
  constants
} from 'node:fs/promises'
import * as fs from 'node:fs'
import { join } from 'path'
import * as net from 'node:net'
import * as os from 'node:os'
import log from 'electron-log/node'
import * as https from 'node:https'
import * as http from 'node:http'
import * as crypto from 'node:crypto'
import { URL } from 'node:url'

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error)

export const checkOrCreateDir = async (dirPath: string): Promise<boolean> => {
  const startedAt = Date.now()
  try {
    await access(dirPath, constants.F_OK)
    await access(dirPath, constants.R_OK | constants.W_OK)
    log.debug('fs:check-or-create-dir:exists', { dirPath, durationMs: Date.now() - startedAt })
    return true
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException
    if (nodeError.code === 'ENOENT') {
      try {
        await mkdir(dirPath, { recursive: true })
        log.debug('fs:check-or-create-dir:created', {
          dirPath,
          durationMs: Date.now() - startedAt
        })
        return true
      } catch {
        log.error('fs:check-or-create-dir:create-failed', {
          dirPath,
          durationMs: Date.now() - startedAt
        })
        return false
      }
    } else if (nodeError.code === 'EACCES') {
      log.error('fs:check-or-create-dir:access-denied', { dirPath })
      return false
    } else {
      log.error('fs:check-or-create-dir:failed', {
        dirPath,
        error: getErrorMessage(error),
        durationMs: Date.now() - startedAt
      })
    }
  }
  return false
}

export const checkOrCreateFile = async (
  filePath: string,
  data: undefined | string
): Promise<null | string> => {
  try {
    return await readFile(filePath, { encoding: 'utf-8' })
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException
    if (nodeError.code === 'ENOENT') {
      if (data !== undefined) {
        await writeFile(filePath, data)
        return data
      }
    }
  }
  return null
}
export const checkFile = async (filePath: string): Promise<boolean> => {
  try {
    await readFile(filePath, { encoding: 'utf-8' })
    return true
  } catch {
    return false
  }
}

export const appendToFile = async (filePath: string, data: string): Promise<boolean> => {
  const startedAt = Date.now()
  try {
    await appendFile(filePath, data)
    log.debug('fs:append-to-file:success', {
      filePath,
      bytes: data.length,
      durationMs: Date.now() - startedAt
    })
    return true
  } catch (error) {
    log.error('fs:append-to-file:failed', {
      filePath,
      error: getErrorMessage(error),
      durationMs: Date.now() - startedAt
    })
    return false
  }
}

const _checkPortHost = async (port: number, address: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const server = net.createServer()
    server
      .listen(port, address, () => {
        server.close(() => resolve(true))
      })
      .on('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
          resolve(false)
        } else {
          resolve(true)
        }
      })
  })
}
export const checkPort = async (port: number): Promise<boolean> => {
  const interfaces = os.networkInterfaces()
  const addresses: string[] = ['0.0.0.0']
  Object.values(interfaces).forEach((interfaceInfos) => {
    interfaceInfos?.forEach((info) => {
      if (info.family === 'IPv4') {
        addresses.push(info.address)
      }
    })
  })
  for (const address of addresses) {
    const isAvailable = await _checkPortHost(port, address)
    if (!isAvailable) return false
  }
  return true
}

export const checkSocket = async (ipcPath: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const client = net.createConnection({ path: ipcPath }, () => {
      client.end()
    })
    client.on('end', () => {
      resolve(true)
    })
    client.on('error', () => {
      resolve(false)
    })
  })
}

export const deleteFolderRecursive = async (path: string): Promise<boolean> => {
  const startedAt = Date.now()
  try {
    await rm(path, { recursive: true, force: true })
    log.debug('fs:delete-folder:success', { path, durationMs: Date.now() - startedAt })
    return true
  } catch (error) {
    log.error('fs:delete-folder:failed', {
      path,
      error: getErrorMessage(error),
      durationMs: Date.now() - startedAt
    })
    return false
  }
}

export const deleteFile = async (filePath: string): Promise<boolean> => {
  const startedAt = Date.now()
  try {
    await unlink(filePath)
    log.debug('fs:delete-file:success', { filePath, durationMs: Date.now() - startedAt })
    return true
  } catch (error) {
    log.error('fs:delete-file:failed', {
      filePath,
      error: getErrorMessage(error),
      durationMs: Date.now() - startedAt
    })
    return false
  }
}

interface PublicKey {
  id: number | bigint
  coordinatorPublicKey: string
  validatorAddress: string
}
type RemovePublicKeyResponse = {
  id: number | bigint
  status: boolean
}

export const deleteFilesByCoordinatorPublicKeys = async (
  dirPath: string,
  publicKeys: PublicKey[]
): Promise<RemovePublicKeyResponse[]> => {
  const results: RemovePublicKeyResponse[] = []
  const startedAt = Date.now()
  try {
    const files = await readdir(dirPath)
    for (const file of files) {
      const filePath = join(dirPath, file)
      try {
        const fileContent = await readFile(filePath, 'utf-8')
        const json = JSON.parse(fileContent)
        const publicKeyObject = publicKeys.find((pk) => pk.coordinatorPublicKey === json.pubkey)

        if (publicKeyObject) {
          await unlink(filePath)
          results.push({ id: publicKeyObject.id, status: true })
        }
      } catch (error) {
        log.error('fs:delete-coordinator-files:process-file-failed', {
          file,
          error: getErrorMessage(error)
        })
      }
    }
    publicKeys.forEach((pk) => {
      if (!results.some((r) => r.id === pk.id)) {
        results.push({ id: pk.id, status: true })
      }
    })
  } catch (error) {
    log.error('fs:delete-coordinator-files:read-dir-failed', {
      dirPath,
      error: getErrorMessage(error)
    })
  }
  log.debug('fs:delete-coordinator-files:completed', {
    dirPath,
    requested: publicKeys.length,
    processed: results.length,
    durationMs: Date.now() - startedAt
  })
  return results
}

export const deleteFilesByValidatorPublicKeys = async (
  dirPath: string,
  publicKeys: PublicKey[],
  passwordFilePath: string
): Promise<RemovePublicKeyResponse[]> => {
  const results: RemovePublicKeyResponse[] = []
  const filesToDeleteIndexes: number[] = []
  const startedAt = Date.now()

  try {
    const files = await readdir(dirPath)
    for (const [index, key] of publicKeys.entries()) {
      const fileToDelete = files.find((file) => file.includes(key.validatorAddress))
      if (fileToDelete) {
        try {
          await unlink(join(dirPath, fileToDelete))
          results.push({ id: key.id, status: true })
          filesToDeleteIndexes.push(index)
        } catch (error) {
          log.error('fs:delete-validator-files:delete-file-failed', {
            file: fileToDelete,
            error: getErrorMessage(error)
          })
          results.push({ id: key.id, status: false })
        }
      } else {
        results.push({ id: key.id, status: true })
      }
    }

    if (filesToDeleteIndexes.length > 0) {
      const passwords = await readFile(passwordFilePath, 'utf-8')
      const passwordsArray = passwords.split('\n')

      for (const index of filesToDeleteIndexes.sort((a, b) => b - a)) {
        passwordsArray.splice(index, 1)
      }
      await writeFile(passwordFilePath, passwordsArray.join('\n'))
    }
  } catch (error) {
    log.error('fs:delete-validator-files:failed', {
      dirPath,
      error: getErrorMessage(error)
    })
  }
  log.debug('fs:delete-validator-files:completed', {
    dirPath,
    requested: publicKeys.length,
    processed: results.length,
    passwordEntriesRemoved: filesToDeleteIndexes.length,
    durationMs: Date.now() - startedAt
  })
  return results
}

export const getPublicIP = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    https
      .get('https://api.ipify.org', (resp) => {
        let data = ''

        resp.on('data', (chunk) => {
          data += chunk
        })

        resp.on('end', () => {
          resolve(data)
        })
      })
      .on('error', (err) => {
        reject('Error: ' + err.message)
      })
  })
}

export const readJSON = async (filePath: string): Promise<string> => {
  try {
    return await readFile(filePath, { encoding: 'utf-8' })
  } catch {
    return ''
  }
}

export const fetchJSONFromUrl = async <T>(url: string): Promise<T> => {
  const timeoutMs = 15000
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} fetching ${url}`)
    }
    return (await response.json()) as T
  } finally {
    clearTimeout(timeout)
  }
}

export const createTempDir = async (prefix: string): Promise<string> => {
  return await mkdtemp(join(os.tmpdir(), prefix))
}

export const copyFileReplace = async (sourcePath: string, targetPath: string): Promise<void> => {
  await copyFile(sourcePath, targetPath)
}

export const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await access(filePath, constants.F_OK)
    return true
  } catch {
    return false
  }
}

export const computeFileSha512 = async (filePath: string): Promise<string> => {
  return await new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha512')
    const stream = fs.createReadStream(filePath)
    stream.on('data', (chunk) => hash.update(chunk))
    stream.on('end', () => resolve(hash.digest('hex')))
    stream.on('error', reject)
  })
}

export const downloadToFileAtomic = async (
  url: string,
  destPath: string,
  onProgress?: (received: number, total: number) => void,
  redirectsLeft = 5
): Promise<void> => {
  if (redirectsLeft < 0) {
    throw new Error(`Too many redirects downloading ${url}`)
  }

  await new Promise<void>((resolve, reject) => {
    const parsed = new URL(url)
    const client = parsed.protocol === 'https:' ? https : http
    const req = client.get(url, (res) => {
      if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
        void downloadToFileAtomic(res.headers.location, destPath, onProgress, redirectsLeft - 1)
          .then(resolve)
          .catch(reject)
        return
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} downloading ${url}`))
        return
      }

      const total = parseInt(res.headers['content-length'] ?? '0', 10)
      let received = 0
      const tmpPath = `${destPath}.tmp`
      const stream = fs.createWriteStream(tmpPath)

      res.on('data', (chunk: Buffer) => {
        received += chunk.length
        stream.write(chunk)
        onProgress?.(received, total)
      })

      res.on('end', () => {
        stream.end()
        stream.on('close', () => {
          void rename(tmpPath, destPath)
            .then(() => resolve())
            .catch((err) => {
              void unlink(tmpPath).catch(() => {})
              reject(err)
            })
        })
        stream.on('error', (err) => {
          void unlink(tmpPath).catch(() => {})
          reject(err)
        })
      })

      res.on('error', (err) => {
        stream.destroy()
        void unlink(tmpPath).catch(() => {})
        reject(err)
      })
    })
    req.on('error', reject)
  })
}

export const makeFileExecutableIfNeeded = async (filePath: string): Promise<void> => {
  if (process.platform !== 'win32') {
    await chmod(filePath, 0o755)
  }
}
