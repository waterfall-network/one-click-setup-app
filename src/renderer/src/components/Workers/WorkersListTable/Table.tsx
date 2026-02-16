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
import React, { useMemo } from 'react'
import { columns } from './Columns'
import { ActionTxType, Worker } from '../../../types/workers'
import { LiveValue } from '@renderer/ui-kit/LiveValue'

type WorkersListTablePropsT = {
  data: Worker[]
  filters?: {
    status: ColumnFilterItem[]
    node: ColumnFilterItem[]
  }
  rewardAmount?: number
  onRowClick: (id: number) => void
  onAction: (action: null | ActionTxType, workerId: undefined | string) => void
  onSelect?: (selectedRowKeys: (number | bigint)[]) => void
  pagination?: {
    current: number
    pageSize: number
    total: number
    onChange: (page: number, pageSize: number) => void
  }
  selectedRowKeys?: (number | bigint)[]
  onFiltersChange?: (filters: {
    status?: string[]
    node?: string[]
    reward?: { min?: number; max?: number }
  }) => void
  activeFilters?: { status?: string[]; node?: string[]; reward?: { min?: number; max?: number } } // Active filters from parent to sync
}

export const WorkersListTable: React.FC<WorkersListTablePropsT> = ({
  data,
  filters: filtersProp,
  rewardAmount: rewardAmountProp,
  onRowClick,
  onAction,
  onSelect,
  pagination,
  selectedRowKeys,
  onFiltersChange,
  activeFilters
}) => {
  // Use activeFilters from parent as source of truth - no local state
  // This ensures filters persist across component remounts
  const currentFilters = activeFilters || {}
  const dataSource = useMemo(
    () => (data ? data.map((item) => ({ ...item, key: `${item.id}` })) : []),
    [data]
  )
  const onActivate = (id?: string) => onAction(ActionTxType.activate, id)
  const onDeactivate = (id?: string) => onAction(ActionTxType.deActivate, id)
  const onWithdraw = (id?: string) => onAction(ActionTxType.withdraw, id)
  const onRemove = (id?: string) => onAction(ActionTxType.remove, id)

  // Use provided filters and rewardAmount from server
  const filters = filtersProp || { status: [], node: [] }
  const rewardAmount = rewardAmountProp || 0

  // Memoize columns to prevent recreation on every render
  const getColumns = useMemo(
    () =>
      columns({
        activate: onActivate,
        deactivate: onDeactivate,
        withdraw: onWithdraw,
        remove: onRemove,
        filters,
        rewardAmount,
        filteredValues: currentFilters,
        onRewardFilterChange: (reward) => {
          if (onFiltersChange) {
            onFiltersChange({
              ...currentFilters,
              reward
            })
          }
        }
      }),
    [
      onActivate,
      onDeactivate,
      onWithdraw,
      onRemove,
      filters,
      rewardAmount,
      currentFilters,
      onFiltersChange
    ]
  )

  const rowSelection = {
    selectedRowKeys: selectedRowKeys?.map((key) => key.toString()),
    onChange: (selectedKeys: React.Key[]) => {
      const keys = selectedKeys.map((key) => {
        const numKey = typeof key === 'string' ? parseInt(key, 10) : key
        return typeof numKey === 'number' && !isNaN(numKey) ? numKey : BigInt(key.toString())
      })
      onSelect?.(keys as (number | bigint)[])
    }
  }

  const handleTableChange = (paginationData, filtersData) => {
    // Note: reward filter is handled separately via onRewardFilterChange in columns
    const newFilters = {
      status: filtersData?.status || [],
      node: filtersData?.node || [],
      reward: currentFilters?.reward // Keep existing reward filter
    }

    if (onFiltersChange) {
      onFiltersChange(newFilters)
    }

    if (pagination && paginationData) {
      pagination.onChange(paginationData.current || 1, paginationData.pageSize || 100)
    }
  }

  const paginationConfig = pagination
    ? {
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: false,
        showTotal: (total: number) => (
          <>
            Total <LiveValue value={total}>{total}</LiveValue> items
          </>
        )
      }
    : false

  return (
    <Table
      dataSource={dataSource}
      columns={getColumns}
      rowSelection={{
        type: 'checkbox',
        ...rowSelection
      }}
      pagination={paginationConfig}
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
