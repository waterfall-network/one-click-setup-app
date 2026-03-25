/*
 * Copyright 2026   Digital Clever Solution Inc.
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
import { NodesWorkersDataFields, NodesWorkersDataTypes } from '@renderer/types/node'
import { ButtonPrimary } from '@renderer/ui-kit/Button'
import { TableColumnsType } from '@renderer/ui-kit/Table'
import { LiveValue } from '@renderer/ui-kit/LiveValue'

export type DataType = NodesWorkersDataTypes & {
  key: React.Key
}

export const columns = (generateFN: (id?: string) => void): TableColumnsType<DataType> => [
  { title: 'Validator ID', dataIndex: NodesWorkersDataFields.id, key: NodesWorkersDataFields.id },
  {
    title: 'Status',
    dataIndex: NodesWorkersDataFields.status,
    key: NodesWorkersDataFields.status,
    render: (value) => <LiveValue value={String(value)}>{value}</LiveValue>
  },
  {
    title: 'Worked Hours',
    dataIndex: NodesWorkersDataFields.workedHours,
    key: NodesWorkersDataFields.workedHours,
    render: (value) => <LiveValue value={String(value)}>{value}</LiveValue>
  },

  {
    title: 'Actions',
    dataIndex: NodesWorkersDataFields.actions,
    key: NodesWorkersDataFields.actions
  },
  {
    title: 'Deposit Data',
    dataIndex: NodesWorkersDataFields.deposit,
    key: NodesWorkersDataFields.deposit,
    render: ({ data, id }) => {
      if (data) return <>{data}</>

      const onClick = () => generateFN(id)
      return <ButtonPrimary onClick={onClick}>Generate</ButtonPrimary>
    }
  }
]
