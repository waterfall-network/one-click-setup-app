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
import { EarnedTableDataTypes } from '@renderer/types/statistics'
import { Title } from '@renderer/ui-kit/Typography'
import { Table } from '@renderer/ui-kit/Table'
import { Flex } from '@renderer/ui-kit/Flex'
import { styled } from 'styled-components'
import { StockOutlined } from '@ant-design/icons'

const columns = [
  { title: 'Day', dataIndex: 'day', key: 'day' },
  { title: 'Week', dataIndex: 'week', key: 'week' },
  { title: 'Month', dataIndex: 'month', key: 'month' },
  { title: 'Year', dataIndex: 'year', key: 'year' }
]

type PropsT = {
  data?: EarnedTableDataTypes[]
}
export const StatisticsEarnedTable: React.FC<PropsT> = ({ data }) => {
  return (
    <Wrapper>
      <Title level={5}>
        <Flex gap={10}>
          <StockOutlined />
          Earned rewards
        </Flex>
      </Title>
      <Table dataSource={data} columns={columns} pagination={false} />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  .ant-table-cell {
    text-align: center !important;
  }
  .ant-table-content {
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 6px;
  }
  margin-bottom: 25px;
`
