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
import { ColumnFilterItem } from 'antd/es/table/interface'
import React, { useMemo, useCallback } from 'react'
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

const WorkersListTableBase: React.FC<WorkersListTablePropsT> = ({
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
  const dataSource = useMemo(() => data || [], [data])
  const onActivate = useCallback((id?: string) => onAction(ActionTxType.activate, id), [onAction])
  const onDeactivate = useCallback(
    (id?: string) => onAction(ActionTxType.deActivate, id),
    [onAction]
  )
  const onWithdraw = useCallback((id?: string) => onAction(ActionTxType.withdraw, id), [onAction])
  const onRemove = useCallback((id?: string) => onAction(ActionTxType.remove, id), [onAction])

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

  const rowSelection = useMemo(
    () => ({
      selectedRowKeys: selectedRowKeys?.map((key) => key.toString()),
      onChange: (selectedKeys: React.Key[]) => {
        const keys = selectedKeys.map((key) => {
          const numKey = typeof key === 'string' ? parseInt(key, 10) : key
          return typeof numKey === 'number' && !isNaN(numKey) ? numKey : BigInt(key.toString())
        })
        onSelect?.(keys as (number | bigint)[])
      }
    }),
    [onSelect, selectedRowKeys]
  )

  const handleTableChange = useCallback(
    (paginationData, filtersData) => {
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
    },
    [currentFilters?.reward, onFiltersChange, pagination]
  )

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

  const handleRow = useCallback(
    (record: Worker) => ({
      style: {
        cursor: 'pointer'
      },
      onClick: () => {
        onRowClick(Number(record.id))
      }
    }),
    [onRowClick]
  )

  return (
    <Table
      dataSource={dataSource}
      rowKey={(record) => record.id.toString()}
      columns={getColumns}
      rowSelection={{
        type: 'checkbox',
        ...rowSelection
      }}
      pagination={paginationConfig}
      disableRowAnimation
      onRow={handleRow}
      onChange={handleTableChange}
    />
  )
}

export const WorkersListTable = React.memo(WorkersListTableBase)
