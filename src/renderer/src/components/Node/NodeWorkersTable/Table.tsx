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
import { Table } from '@renderer/ui-kit/Table'
import React from 'react'
import { DataType, columns } from './Columns'
import { styled } from 'styled-components'

type NodesListTablePropsT = {
  data: DataType[]
  generate: (id?: string) => void
}

export const NodesWorkersTable: React.FC<NodesListTablePropsT> = ({ data, generate }) => {
  const table_columns = columns(generate)
  return (
    <Wrapper>
      <Table dataSource={data} columns={table_columns} />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  margin-top: 30px;
`
