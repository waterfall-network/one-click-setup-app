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
import { Node, NewNode } from '@renderer/types/node'

import { LAST_SNAPSHOT_URL } from '@renderer/constants/env'
import { Snapshots } from '../types/node'
import { isSnapshots } from '../helpers/node'

export enum StatusResult {
  success = 'success',
  fail = 'fail'
}

export type StatusResults = {
  coordinatorBeacon: StatusResult
  coordinatorValidator: StatusResult
  validator: StatusResult
}

export const start = async (id: number | bigint): Promise<StatusResults> => {
  return await window.node.start(id)
}
export const stop = async (id: number | bigint): Promise<StatusResults> => {
  return await window.node.stop(id)
}

export const restart = async (id: number | bigint): Promise<StatusResults> => {
  return await window.node.restart(id)
}

export const getAll = async (): Promise<Node[]> => {
  return await window.node.getAll()
}

export const getById = async (id: number | bigint): Promise<Node> => {
  return await window.node.getById(id)
}

export const add = async (newNode: NewNode): Promise<Node> => {
  return await window.node.add(newNode)
}

export const checkPorts = async (ports: number[]): Promise<boolean[]> => {
  return await window.node.checkPorts(ports)
}

export const remove = async (ids: number[] | bigint[], withData = false) => {
  return await window.node.remove(ids, withData)
}

export const getLastSnapshots = async (): Promise<Snapshots | null> => {
  const data = await window.os.fetchJSON(`${LAST_SNAPSHOT_URL}?date=${new Date().getTime()}`)
  if (data && isSnapshots(data)) {
    return data as Snapshots
  }
  return null
}
