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
import * as net from 'node:net'
import Web3 from 'web3'
import log from 'electron-log/node'
export const getWeb3 = (provider: string): Web3 => {
  let _provider
  if (provider.includes('.ipc')) {
    const socket = new net.Socket()
    _provider = new Web3.providers.IpcProvider(provider, socket)
    _provider.on('connect', () => {
      log.debug('connect', provider)
    })
    _provider.on('error', () => {
      log.debug('error', provider)
    })
    _provider.on('end', () => {
      log.debug('end', provider)
    })
  } else {
    _provider = new Web3.providers.HttpProvider(provider)
  }
  return new Web3(_provider)
}
