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
import React from 'react'

import { Table } from '@renderer/ui-kit/Table'
import { TableColumnsType } from '@renderer/ui-kit/Table'
import { DisplayKeysDataType, DisplayKeysFields } from '@renderer/types/workers'

type DataType = DisplayKeysDataType & {
  key: React.Key
}

const columns = (): TableColumnsType<DataType> => [
  { title: 'Validator #', dataIndex: DisplayKeysFields.id, key: DisplayKeysFields.id },
  {
    title: 'Coordinator public Key',
    dataIndex: DisplayKeysFields.coordinatorKey,
    key: DisplayKeysFields.coordinatorKey
  },
  {
    title: 'Verifier public Key',
    dataIndex: DisplayKeysFields.validatorKey,
    key: DisplayKeysFields.validatorKey
  },

  {
    title: 'Withdrawal address',
    dataIndex: DisplayKeysFields.withdrawalAddress,
    key: DisplayKeysFields.withdrawalAddress
  }
]

type WorkerKeysTablePropsT = {
  data: DisplayKeysDataType[]
}

export const WorkerKeysTable: React.FC<WorkerKeysTablePropsT> = ({ data }) => {
  const tableColumns = columns()

  return <Table dataSource={data} columns={tableColumns} />
}
