/*
 * Copyright 2024   Blue Wave Inc.
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
  constants
} from 'node:fs/promises'
import { join } from 'path'
import * as net from 'node:net'
import * as os from 'node:os'
import log from 'electron-log/node'
import * as https from 'node:https'

export const checkOrCreateDir = async (dirPath: string): Promise<boolean> => {
  try {
    await access(dirPath, constants.F_OK)
    await access(dirPath, constants.R_OK | constants.W_OK)
    return true
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException
    if (nodeError.code === 'ENOENT') {
      try {
        await mkdir(dirPath, { recursive: true })
        return true
      } catch {
        log.error('Not permissions to create dir:', dirPath)
        return false
      }
    } else if (nodeError.code === 'EACCES') {
      log.error('Not permissions to access dir:', dirPath)
      return false
    } else {
      log.error('Other error:', dirPath)
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
  try {
    await appendFile(filePath, data)
    return true
  } catch {
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
  const checks: Promise<boolean>[] = [_checkPortHost(port, '0.0.0.0')]
  Object.values(interfaces).forEach((interfaceInfos) => {
    interfaceInfos?.forEach((info) => {
      if (info.family === 'IPv4') {
        checks.push(_checkPortHost(port, info.address))
      }
    })
  })
  return Promise.all(checks).then((results) => {
    return results.every((isAvailable) => isAvailable)
  })
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
  try {
    await rm(path, { recursive: true, force: true })
    return true
  } catch (error) {
    log.error('deleteFolderRecursive', error)
    return false
  }
}

export const deleteFile = async (filePath: string): Promise<boolean> => {
  try {
    await unlink(filePath)
    return true
  } catch (error) {
    log.error('deleteFile', error)
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
        log.error('deleteFilesByCoordinatorPublicKeys', `Error processing file ${file}:`, error)
      }
    }
    publicKeys.forEach((pk) => {
      if (!results.some((r) => r.id === pk.id)) {
        results.push({ id: pk.id, status: true })
      }
    })
  } catch (error) {
    log.error('deleteFilesByCoordinatorPublicKeys', 'Error reading directory:', error)
  }
  return results
}

export const deleteFilesByValidatorPublicKeys = async (
  dirPath: string,
  publicKeys: PublicKey[],
  passwordFilePath: string
): Promise<RemovePublicKeyResponse[]> => {
  const results: RemovePublicKeyResponse[] = []
  const filesToDeleteIndexes: number[] = []

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
          log.error(
            'deleteFilesByValidatorPublicKeys',
            `Error deleting file: ${fileToDelete}`,
            error
          )
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
    console.error('deleteFilesByValidatorPublicKeys', 'Error processing:', error)
  }
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
