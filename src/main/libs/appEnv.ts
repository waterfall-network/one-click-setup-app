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
import path from 'node:path'
import { BIN_BASE_URL, Network } from './env'
import { platform, arch } from 'node:os'

interface Options {
  isPackaged: boolean
  appPath: string
  userData: string
  version: string
}

class AppEnv {
  public isPackaged = false
  public appPath: string = ''
  public userData: string = ''
  public version: string = ''
  public mainDB: string = ''
  public binariesDir: string = ''

  constructor(options: Options) {
    this.isPackaged = options.isPackaged
    this.appPath = options.appPath
    this.userData = options.userData
    this.version = options.version
    this.mainDB = path.join(this.userData, 'wf.db')
    this.binariesDir = path.join(this.userData, 'bin')
  }

  getUserDataPath(): string {
    return this.userData
  }

  getMainDBPath(): string {
    return this.mainDB
  }

  getPlatform(): 'linux' | 'mac' | 'win' | null {
    switch (platform()) {
      case 'aix':
      case 'freebsd':
      case 'linux':
      case 'openbsd':
      case 'android':
        return 'linux'
      case 'darwin':
      case 'sunos':
        return 'mac'
      case 'win32':
        return 'win'
      default:
        return null
    }
  }
  getArch(): 'x64' | 'arm64' | null {
    switch (arch()) {
      case 'arm64':
        return 'arm64'
      case 'x64':
        return 'x64'
      default:
        return null
    }
  }

  getBinariesPath(): string {
    return this.binariesDir
  }

  getManagedBinaryBaseUrl(): string {
    return BIN_BASE_URL as string
  }

  getManagedBinaryManifestUrl(): string {
    return `${this.getManagedBinaryBaseUrl()}latest.json`
  }

  getManagedBinaryFilename(name: string): string {
    return this.getPlatform() === 'win' ? `${name}.exe` : name
  }

  getGenesisPath(): string {
    return this.isPackaged
      ? path.join(process.resourcesPath, './genesis')
      : path.join(this.appPath, 'resources', 'genesis')
  }

  getValidatorBinPath = (_network: Network) => {
    return path.resolve(
      path.join(this.getBinariesPath(), this.getManagedBinaryFilename('verifier-mainnet'))
    )
  }

  getCoordinatorBeaconBinPath = (_network: Network) => {
    return path.resolve(
      path.join(this.getBinariesPath(), this.getManagedBinaryFilename('coordinator-beacon-mainnet'))
    )
  }

  getCoordinatorValidatorBinPath = (_network: Network) => {
    return path.resolve(
      path.join(
        this.getBinariesPath(),
        this.getManagedBinaryFilename('coordinator-validator-mainnet')
      )
    )
  }

  getCoordinatorBeaconGenesisPath = (network: Network) =>
    path.resolve(path.join(this.getGenesisPath(), `./coordinator-genesis-${network}.ssz`))

  getValidatorGenesisPath = (network: Network) =>
    path.resolve(path.join(this.getGenesisPath(), `./validator-genesis-${network}.json`))

  getValidatorGenesisDataPath = (network: Network) =>
    path.resolve(path.join(this.getGenesisPath(), `./validator-genesis-data-${network}.json`))

  getValidatorSocket = (num: string) => {
    const platform = this.getPlatform()
    if (platform === 'win') {
      return `\\\\.\\pipe\\wf-${num}.ipc`
    }
    const linuxRuntimeDir =
      platform === 'linux' && process.env.XDG_RUNTIME_DIR ? process.env.XDG_RUNTIME_DIR : '/tmp'
    return path.resolve(path.join(linuxRuntimeDir, `wf-${num}.ipc`))
  }
}

export default AppEnv
