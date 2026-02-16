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
import { NodesListDataTypes, NodesListDataFields, Node } from '@renderer/types/node'
import { getDateTime } from '@renderer/helpers/date'
import { getNodeStatusLabel } from '@renderer/helpers/node'
import { TableColumnsType } from '@renderer/ui-kit/Table'

export type DataType = Node &
  NodesListDataTypes & {
    key: React.Key
  }

export const columns: TableColumnsType<DataType> = [
  { title: '#', dataIndex: NodesListDataFields.id, key: NodesListDataFields.id },
  { title: 'Name', dataIndex: NodesListDataFields.name, key: NodesListDataFields.name },
  {
    title: 'Type',
    dataIndex: NodesListDataFields.type,
    key: NodesListDataFields.type
  },
  {
    title: 'Location',
    dataIndex: NodesListDataFields.locationDir,
    key: NodesListDataFields.locationDir
  },

  {
    title: 'Status',
    dataIndex: NodesListDataFields.status,
    key: NodesListDataFields.status,
    render: (_, node) => getNodeStatusLabel(node)
  },
  {
    title: 'Validators',
    dataIndex: NodesListDataFields.workersCount,
    key: NodesListDataFields.workersCount
  },
  {
    title: 'Added',
    dataIndex: NodesListDataFields.createdAt,
    key: NodesListDataFields.createdAt,
    render: (field) => getDateTime(field)
  }
]
