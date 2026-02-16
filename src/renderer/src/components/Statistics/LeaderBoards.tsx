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
import { LeaderBoardTableDataTypes } from '@renderer/types/statistics'
import { Table } from '@renderer/ui-kit/Table'
import { Title } from '@renderer/ui-kit/Typography'
import { Flex } from '@renderer/ui-kit/Flex'
import React from 'react'
import { styled } from 'styled-components'

type PropsT = {
  allTimeData: LeaderBoardTableDataTypes[]
  singleEpochData: LeaderBoardTableDataTypes[]
}

const columns = [
  { title: '№', dataIndex: 'number', key: 'number' },
  { title: 'index', dataIndex: 'index', key: 'index' },
  { title: 'Balance (WATER)', dataIndex: 'balance', key: 'balance' },
  { title: 'Rewards (WATER)', dataIndex: 'rewards', key: 'rewards' }
]

export const LeaderBoards: React.FC<PropsT> = ({ allTimeData, singleEpochData }) => {
  return (
    <Wrapper justify="space-between">
      <TableView>
        <Title level={5}>All-Time Data</Title>
        <Table dataSource={allTimeData} columns={columns} />
      </TableView>
      <TableView>
        <Title level={5}>Single Epoch Data</Title>
        <Table dataSource={singleEpochData} columns={columns} />
      </TableView>
    </Wrapper>
  )
}

const Wrapper = styled(Flex)``

const TableView = styled.div`
  h5 {
    margin-bottom: 30px;
    text-align: center;
  }
  width: 46%;
  .ant-table-cell {
    text-align: center !important;
  }
`
