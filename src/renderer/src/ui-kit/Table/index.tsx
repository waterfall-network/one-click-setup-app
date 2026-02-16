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
import { Table as AntdTable, TableProps } from 'antd'
import React from 'react'
import { keyframes, styled } from 'styled-components'

export { type TableProps }
export type { TableColumnsType } from 'antd'

export const Table: React.FC<TableProps<any>> = ({ pagination, ...props }) => {
  return (
    <TableWrapper>
      <StyledTable
        pagination={pagination !== undefined ? pagination : false}
        {...(props as React.ComponentProps<typeof StyledTable>)}
      />
    </TableWrapper>
  )
}

const rowReveal = keyframes`
  from {
    opacity: 0;
    transform: translateY(3px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const TableWrapper = styled.div`
  .ant-table-wrapper {
    width: 100%;
  }

  .ant-table-container {
    border: 1px solid ${({ theme }) => theme.palette.semantic.table.border};
    border-radius: 14px;
    overflow: hidden;
  }

  .ant-table {
    background: transparent;
  }

  .ant-table-thead > tr > th {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.01em;
    border-bottom-color: ${({ theme }) => theme.palette.semantic.table.headerSplit};
  }

  .ant-table-tbody > tr > td {
    border-bottom-color: ${({ theme }) => theme.palette.semantic.table.rowBorder};
    transition: background 0.22s ease;
  }

  .ant-table-tbody > tr {
    animation: ${rowReveal} 170ms ease-out both;
  }

  .ant-table-tbody > tr:nth-child(1) {
    animation-delay: 0ms;
  }
  .ant-table-tbody > tr:nth-child(2) {
    animation-delay: 15ms;
  }
  .ant-table-tbody > tr:nth-child(3) {
    animation-delay: 30ms;
  }
  .ant-table-tbody > tr:nth-child(4) {
    animation-delay: 45ms;
  }
  .ant-table-tbody > tr:nth-child(5) {
    animation-delay: 60ms;
  }
  .ant-table-tbody > tr:nth-child(6) {
    animation-delay: 75ms;
  }
  .ant-table-tbody > tr:nth-child(7) {
    animation-delay: 90ms;
  }
  .ant-table-tbody > tr:nth-child(8) {
    animation-delay: 105ms;
  }
  .ant-table-tbody > tr:nth-child(9) {
    animation-delay: 120ms;
  }
  .ant-table-tbody > tr:nth-child(10) {
    animation-delay: 135ms;
  }

  @media (prefers-reduced-motion: reduce) {
    .ant-table-tbody > tr {
      animation: none;
    }
  }

  .ant-table-pagination {
    margin: 14px 4px 0 !important;
  }
`
const StyledTable = styled(AntdTable)``
