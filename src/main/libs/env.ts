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

const ENV = import.meta.env

export enum Network {
  testnet8 = 'testnet8',
  testnet9 = 'testnet9',
  mainnet = 'mainnet'
}

export const DATA_PATH = ENV.VITE_DATA_PATH
export const BIN_BASE_URL = ENV.MAIN_VITE_BIN_BASE_URL
export const getCoordinatorBootnode = (network: Network): string =>
  ENV[`MAIN_VITE_COORDINATOR_BOOTNODE_${network.toUpperCase()}`]

export const getCoordinatorNetwork = (network: Network): string => {
  if (network === Network.testnet8) {
    return '--testnet8'
  } else if (network === Network.testnet9) {
    return '--testnet9'
  } else if (network === Network.mainnet) {
    return '--mainnet'
  }
  return ''
}

export const getValidatorNetwork = (network: Network): string => {
  if (network === Network.testnet8) {
    return '--testnet8'
  } else if (network === Network.testnet9) {
    return '--testnet9'
  } else if (network === Network.mainnet) {
    return '--mainnet'
  }
  return ''
}

export const getValidatorBootnode = (network: Network): string =>
  ENV[`MAIN_VITE_VALIDATOR_BOOTNODE_${network.toUpperCase()}`]
export const getChainId = (network: Network): string =>
  ENV[`VITE_CHAIN_ID_${network.toUpperCase()}`]

export const getValidatorAddress = (network: Network): string =>
  ENV[`VITE_VALIDATOR_ADDRESS_${network.toUpperCase()}`]

export const getLocationPath = (dataPath: string): string => path.resolve(dataPath)
export const getCoordinatorPath = (dataPath: string): string =>
  path.resolve(path.join(dataPath, 'coordinator'))
export const getCoordinatorWalletPath = (dataPath: string): string =>
  path.resolve(path.join(getCoordinatorPath(dataPath), 'wallet'))
export const getCoordinatorKeysPath = (dataPath: string): string =>
  path.resolve(path.join(getCoordinatorWalletPath(dataPath), 'keys'))

export const getCoordinatorKeyPath = (dataPath: string, name: string): string =>
  path.resolve(path.join(getCoordinatorKeysPath(dataPath), name))

export const getCoordinatorWalletPasswordPath = (dataPath: string): string =>
  path.resolve(path.join(getCoordinatorWalletPath(dataPath), 'password.txt'))

export const getValidatorPath = (dataPath: string): string =>
  path.resolve(path.join(dataPath, 'gwat'))

export const getValidatorKeystorePath = (dataPath: string, name?: string): string =>
  path.resolve(path.join(getValidatorPath(dataPath), 'keystore', name || ''))

export const getValidatorPasswordPath = (dataPath: string): string =>
  path.resolve(path.join(getValidatorPath(dataPath), 'password.txt'))

export const getValidatorNodeKeyPath = (dataPath: string): string =>
  path.resolve(path.join(getValidatorPath(dataPath), 'gwat', 'nodekey'))
export const getLogPath = (dataPath: string): string => path.resolve(path.join(dataPath, 'logs'))

export const getSnapshotPath = (dataPath: string): string =>
  path.resolve(path.join(dataPath, 'snapshot.tar'))

export const COORDINATOR_HTTP_API_PORT = ENV.VITE_COORDINATOR_HTTP_API_PORT
export const COORDINATOR_HTTP_VALIDATOR_API_PORT = ENV.VITE_COORDINATOR_HTTP_VALIDATOR_API_PORT
export const COORDINATOR_P2P_TCP_PORT = ENV.VITE_COORDINATOR_P2P_TCP_PORT
export const COORDINATOR_P2P_UDP_PORT = ENV.VITE_COORDINATOR_P2P_UDP_PORT
export const VALIDATOR_P2P_PORT = ENV.VITE_VALIDATOR_P2P_PORT
export const VALIDATOR_HTTP_API_PORT = ENV.VITE_VALIDATOR_HTTP_API_PORT
export const VALIDATOR_WS_API_PORT = ENV.VITE_VALIDATOR_WS_API_PORT

export const getStakeAmount = (network: Network): number => {
  if (network === Network.testnet8) {
    return 3200
  } else if (network === Network.testnet9) {
    return 32000
  } else if (network === Network.mainnet) {
    return 32000
  }
  return 32000
}

export const getRPCs = (network: Network): string[] => {
  const rpcEnv = ENV[`VITE_RPC_${network.toUpperCase()}`]
  if (!rpcEnv) {
    return []
  }
  return rpcEnv
    .split(',')
    .map((url) => url.trim())
    .filter((url) => url.length > 0)
}

export const getRPC = (network: Network): string => {
  const rpcs = getRPCs(network)
  return rpcs.length > 0 ? rpcs[0] : ''
}
