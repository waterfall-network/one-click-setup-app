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
import React from 'react'
import { Table } from '@renderer/ui-kit/Table'
import { Flex } from '@renderer/ui-kit/Flex'
import { TableColumnsType } from '@renderer/ui-kit/Table'
import { WorkerTransactionTableFields, WorkerTransactionTableData } from '@renderer/types/workers'
import { ButtonPrimary, ButtonTextPrimary } from '@renderer/ui-kit/Button'
import { Input } from '@renderer/ui-kit/Input'
import { QRCode } from '@renderer/ui-kit/QRCode'

type DataType = WorkerTransactionTableData & {
  key: React.Key
}

const columns = (copyFN: (value: string) => void): TableColumnsType<DataType> => [
  {
    title: 'Validator ID',
    dataIndex: WorkerTransactionTableFields.id,
    key: WorkerTransactionTableFields.id
  },
  {
    title: 'Deposit address',
    dataIndex: WorkerTransactionTableFields.depositAddress,
    key: WorkerTransactionTableFields.depositAddress,
    render: (value) => {
      const handleCopy = () => copyFN(value)
      return (
        <Flex gap={6}>
          <Input value={value} />
          <ButtonTextPrimary ghost onClick={handleCopy}>
            Copy
          </ButtonTextPrimary>
        </Flex>
      )
    }
  },
  {
    title: 'Hex data',
    dataIndex: WorkerTransactionTableFields.hexData,
    key: WorkerTransactionTableFields.hexData,
    render: (value) => {
      const handleCopy = () => copyFN(value)
      return (
        <Flex gap={6}>
          <Input value={value} />
          <ButtonTextPrimary ghost onClick={handleCopy}>
            Copy
          </ButtonTextPrimary>
        </Flex>
      )
    }
  },

  {
    title: 'Value',
    dataIndex: WorkerTransactionTableFields.value,
    key: WorkerTransactionTableFields.value,
    render: (value) => {
      const handleCopy = () => copyFN(value)
      return (
        <Flex gap={6}>
          <Input value={value} />
          <ButtonTextPrimary ghost onClick={handleCopy}>
            Copy
          </ButtonTextPrimary>
        </Flex>
      )
    }
  },
  {
    title: 'QR',
    dataIndex: WorkerTransactionTableFields.qr,
    key: WorkerTransactionTableFields.qr,
    render: (data) => {
      if (!data) return <ButtonPrimary>Generate QR</ButtonPrimary>
      return <QRCode value={data} />
    }
  }
]

type WorkerKeysTablePropsT = {
  data: DataType[]
}

export const WorkerTransactionTable: React.FC<WorkerKeysTablePropsT> = ({ data }) => {
  const copy = (value: string) => navigator.clipboard.writeText(value)
  const tableColumns = columns(copy)

  return <Table dataSource={data} columns={tableColumns} />
}
