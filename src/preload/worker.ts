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
import { ipcRenderer } from 'electron'

import { addParams, ActionTxType } from '../main/worker'
export const worker = {
  genMnemonic: () => ipcRenderer.invoke('worker:genMnemonic'),
  getAll: () => ipcRenderer.invoke('worker:getAll'),
  getById: (id: number) => ipcRenderer.invoke('worker:getById', id),
  getAllByNodeId: (id: number) => ipcRenderer.invoke('worker:getAllByNodeId', id),
  add: (data: addParams) => ipcRenderer.invoke('worker:add', data),
  getActionTx: (action: ActionTxType, id: number, amount?: string) =>
    ipcRenderer.invoke('worker:getActionTx', action, id, amount),
  remove: (ids: number[]) => ipcRenderer.invoke('worker:delete', ids),
  sendActionTx: (action: ActionTxType, ids: number[], pk: string) =>
    ipcRenderer.invoke('worker:sendActionTx', action, ids, pk),

  getDepositDataCount: (path: string) => ipcRenderer.invoke('worker:getDepositDataCount', path),
  getDelegateRules: (path: string) => ipcRenderer.invoke('worker:getDelegateRules', path),
  getBalance: (nodeId: number, address: string) =>
    ipcRenderer.invoke('worker:getBalance', nodeId, address)
}
