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
import { Table } from '@renderer/ui-kit/Table'
import { ColumnFilterItem } from 'antd/es/table/interface'
import React, { useState, useMemo } from 'react'
import { columns } from './Columns'
import { ActionTxType, Worker, Status } from '../../../types/workers'
import { getStatus, getStatusLabel, getStakeAmount } from '@renderer/helpers/workers'

type WorkersListTablePropsT = {
  data: Worker[]
  onRowClick: (id: number) => void
  onAction: (action: null | ActionTxType, workerId: undefined | string) => void
  onSelect?: (workers: Worker[]) => void
  pagination?: boolean
}

export const WorkersListTable: React.FC<WorkersListTablePropsT> = ({
  data,
  onRowClick,
  onAction,
  onSelect
}) => {
  const [tableParamsData, setTableParamsData] = useState<{
    pagination: any
    filters: { status: string[]; node: string[] }
    sorter: any
  }>({ pagination: {}, filters: { status: [], node: [] }, sorter: {} })
  const dataSource = useMemo(
    () => (data ? data.map((item) => ({ ...item, key: `${item.id}` })) : []),
    [data]
  )
  const filters = useMemo(() => {
    const results: { status: ColumnFilterItem[]; node: ColumnFilterItem[] } = {
      status: [],
      node: []
    }
    const filters = dataSource.reduce(
      (cur, worker) => {
        const label = getStatusLabel(worker)
        const nodeName = worker?.node?.name
        if (cur.status[label] === undefined) cur.status[label] = 0
        cur.status[label]++
        if (nodeName) {
          if (cur.node[nodeName] === undefined) cur.node[nodeName] = 0
          cur.node[nodeName]++
        }
        return cur
      },
      {
        status: [],
        node: []
      }
    )
    Object.keys(filters).forEach((key) => {
      Object.keys(filters[key]).forEach((k) => {
        results[key].push({
          text: `${k}(${filters[key][k]})`,
          value: k
        })
      })
    })
    return results
  }, [dataSource])
  const onActivate = (id?: string) => onAction(ActionTxType.activate, id)
  const onDeactivate = (id?: string) => onAction(ActionTxType.deActivate, id)
  const onWithdraw = (id?: string) => onAction(ActionTxType.withdraw, id)
  const onRemove = (id?: string) => onAction(ActionTxType.remove, id)

  const rewardAmount = useMemo(() => {
    return dataSource.reduce((cur, worker) => {
      const status = getStatus(worker)
      const label = getStatusLabel(worker)
      const nodeName = worker?.node?.name
      if (status === Status.pending_initialized) return cur
      if (
        tableParamsData?.filters?.status &&
        tableParamsData?.filters?.status.length > 0 &&
        !tableParamsData.filters.status.includes(label)
      )
        return cur
      if (
        tableParamsData?.filters?.node &&
        tableParamsData?.filters?.node.length > 0 &&
        (!nodeName || !tableParamsData.filters.node.includes(nodeName))
      )
        return cur
      const amount =
        status === Status.active
          ? parseFloat(worker.coordinatorBalanceAmount) - getStakeAmount()
          : parseFloat(worker.coordinatorBalanceAmount)
      return cur + amount
    }, 0)
  }, [tableParamsData, dataSource])

  const getColumns = columns({
    activate: onActivate,
    deactivate: onDeactivate,
    withdraw: onWithdraw,
    remove: onRemove,
    filters,
    rewardAmount
  })

  const rowSelection = {
    onChange: (_, selectedRows: Worker[]) => {
      onSelect?.(selectedRows)
    }
  }

  const handleTableChange = (pagination, filters, sorter) =>
    setTableParamsData({ pagination, filters, sorter })

  return (
    <Table
      dataSource={dataSource}
      columns={getColumns}
      rowSelection={{
        type: 'checkbox',
        ...rowSelection
      }}
      onRow={(record) => ({
        style: {
          cursor: 'pointer'
        },
        onClick: () => {
          onRowClick(record.id)
        }
      })}
      onChange={handleTableChange}
    />
  )
}
