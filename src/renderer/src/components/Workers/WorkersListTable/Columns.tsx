/*
 * Copyright 2026 Digital Clever Solution Inc.
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
import { Flex } from '@renderer/ui-kit/Flex'
import { Space } from '@renderer/ui-kit/Space'
import { TableColumnsType } from '@renderer/ui-kit/Table'
import { ColumnFilterItem } from 'antd/es/table/interface'
import {
  WorkersListDataFields,
  WorkersListDataTypes,
  Worker,
  Status
} from '@renderer/types/workers'
import { Button, IconButton } from '@renderer/ui-kit/Button'
import {
  CloseOutlined,
  CaretRightOutlined,
  WalletOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import { Link } from '@renderer/ui-kit/Link'
import { getViewLink } from '@renderer/helpers/navigation'
import { getStatusLabel, getStatus, getStakeAmount } from '@renderer/helpers/workers'
import { routes } from '@renderer/constants/navigation'
import React from 'react'
import { getActions } from '../../../helpers/workers'
import { ActionTxType } from '../../../types/workers'
import { getNodeStatus } from '../../../helpers/node'
import { Status as NodeStatus } from '../../../types/node'
import { Input } from '@renderer/ui-kit/Input'
import { LiveValue } from '@renderer/ui-kit/LiveValue'
import { Popover } from '@renderer/ui-kit/Popover'

export type DataType = Worker &
  WorkersListDataTypes & {
    key: React.Key
  }

type getColumnsProps = {
  activate: (id?: string) => void
  deactivate: (id?: string) => void
  withdraw: (id?: string) => void
  remove: (id?: string) => void
  filters: {
    status: ColumnFilterItem[]
    node: ColumnFilterItem[]
  }
  rewardAmount: number
  filteredValues?: {
    status?: string[]
    node?: string[]
    reward?: { min?: number; max?: number }
  }
  onRewardFilterChange?: (reward: { min?: number; max?: number }) => void
}

export const columns = ({
  deactivate,
  activate,
  withdraw,
  remove,
  filters,
  rewardAmount,
  filteredValues,
  onRewardFilterChange
}: getColumnsProps): TableColumnsType<DataType> => [
  {
    title: '#',
    dataIndex: WorkersListDataFields.id,
    key: WorkersListDataFields.id
  },
  {
    title: 'Index',
    dataIndex: WorkersListDataFields.validatorIndex,
    key: WorkersListDataFields.validatorIndex,
    sorter: (a, b) =>
      !a[WorkersListDataFields.validatorIndex]
        ? Number.MAX_VALUE
        : a[WorkersListDataFields.validatorIndex] - b[WorkersListDataFields.validatorIndex]
  },
  {
    title: 'Node',
    dataIndex: WorkersListDataFields.node,
    key: WorkersListDataFields.node,
    render: (node) => (
      <Link
        to={getViewLink(routes.nodes.view, { id: node.id })}
        onClick={(e) => e.stopPropagation()}
      >
        {node.name}
      </Link>
    ),
    filters: filters.node,
    filteredValue: filteredValues?.node ?? null,
    onFilter: (value, worker) => worker.node.name === value
  },
  {
    title: 'Status',
    dataIndex: WorkersListDataFields.status,
    key: WorkersListDataFields.status,
    render: (_, worker) => {
      const statusLabel = getStatusLabel(worker)
      return statusLabel
    },
    shouldCellUpdate: (record, prevRecord) =>
      record.coordinatorStatus !== prevRecord.coordinatorStatus ||
      record.validatorStatus !== prevRecord.validatorStatus,
    filters: filters.status,
    filteredValue: filteredValues?.status ?? null,
    onFilter: (value, worker) => getStatusLabel(worker) === value
  },

  {
    title: (
      <div>
        Rewards (WATER) <br />
        Total: <LiveValue value={rewardAmount.toFixed(2)}>{rewardAmount.toFixed(2)}</LiveValue>
      </div>
    ),
    dataIndex: WorkersListDataFields.coordinatorBalanceAmount,
    key: WorkersListDataFields.coordinatorBalanceAmount,
    render: (_, worker) => {
      const status = getStatus(worker)
      const rewardValue = (
        status === Status.active
          ? parseFloat(worker.coordinatorBalanceAmount) - getStakeAmount()
          : parseFloat(worker.coordinatorBalanceAmount)
      ).toFixed(2)
      return rewardValue
    },
    shouldCellUpdate: (record, prevRecord) =>
      record.coordinatorBalanceAmount !== prevRecord.coordinatorBalanceAmount ||
      record.coordinatorStatus !== prevRecord.coordinatorStatus ||
      record.validatorStatus !== prevRecord.validatorStatus,
    filterDropdown: ({ confirm }) => {
      const [minValue, setMinValue] = React.useState<string>('')
      const [maxValue, setMaxValue] = React.useState<string>('')

      React.useEffect(() => {
        const rewardFilter = filteredValues?.reward
        if (rewardFilter) {
          setMinValue(rewardFilter.min?.toString() || '')
          setMaxValue(rewardFilter.max?.toString() || '')
        } else {
          setMinValue('')
          setMaxValue('')
        }
      }, [filteredValues?.reward])

      const hasActiveFilter =
        filteredValues?.reward &&
        [filteredValues.reward.min, filteredValues.reward.max].filter((v) => v !== undefined)
          .length > 0

      const handleFilter = () => {
        const min = minValue ? parseFloat(minValue) : undefined
        const max = maxValue ? parseFloat(maxValue) : undefined
        if (onRewardFilterChange) {
          onRewardFilterChange({ min, max })
        }
        confirm()
      }

      const handleReset = () => {
        // Only reset local input values, don't apply changes
        // User needs to click OK to apply the reset
        setMinValue('')
        setMaxValue('')
      }

      return (
        <div style={{ padding: 8 }}>
          <Space orientation="vertical" style={{ width: '100%' }}>
            <Input
              placeholder="Min"
              value={minValue}
              onChange={(e) => setMinValue(e.target.value)}
              onPressEnter={handleFilter}
              style={{ marginBottom: 8 }}
            />
            <Input
              placeholder="Max"
              value={maxValue}
              onChange={(e) => setMaxValue(e.target.value)}
              onPressEnter={handleFilter}
              style={{ marginBottom: 8 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <Button
                type="link"
                onClick={handleReset}
                disabled={!hasActiveFilter}
                style={{ padding: 0 }}
              >
                Reset
              </Button>
              <Button type="primary" onClick={handleFilter} size="small">
                OK
              </Button>
            </div>
          </Space>
        </div>
      )
    },
    filteredValue:
      filteredValues?.reward &&
      [filteredValues.reward.min, filteredValues.reward.max].filter((v) => v !== undefined).length >
        0
        ? ['active']
        : null
  },
  {
    title: 'Actions',
    dataIndex: WorkersListDataFields.actions,
    key: WorkersListDataFields.actions,
    render: (_, worker) => {
      const actions = getActions(worker)
      const onActivate = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.stopPropagation()
        activate?.(worker.id)
      }
      const onDeactivate = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.stopPropagation()
        deactivate?.(worker.id)
      }
      const onWithdraw = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.stopPropagation()
        withdraw?.(worker.id)
      }

      const onRemove = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.stopPropagation()
        remove?.(worker.id)
      }

      return (
        <Flex gap={30} align="center">
          <Flex gap={6}>
            {actions[ActionTxType.activate] && (
              <Popover
                content="Activate the Validator only if the Node runs and syncs or Node from Provider"
                placement="bottom"
              >
                <IconButton
                  title="Activate"
                  disabled={worker?.node && getNodeStatus(worker?.node) !== NodeStatus.running}
                  icon={<CaretRightOutlined />}
                  shape="default"
                  size="small"
                  onClick={onActivate}
                />
              </Popover>
            )}
            {actions[ActionTxType.deActivate] && (
              <Popover
                content="Deactivate the Validator only if the Node runs and syncs or Node from Provider"
                placement="bottom"
              >
                <IconButton
                  title="Deactivate"
                  disabled={worker?.node && getNodeStatus(worker?.node) !== NodeStatus.running}
                  icon={<CloseOutlined />}
                  shape="default"
                  size="small"
                  onClick={onDeactivate}
                />
              </Popover>
            )}
            {actions[ActionTxType.withdraw] && (
              <Popover
                content="Withdraw the Validator only if the Node runs and syncs or Node from Provider"
                placement="bottom"
              >
                <IconButton
                  title="Withdraw"
                  disabled={worker?.node && getNodeStatus(worker?.node) !== NodeStatus.running}
                  icon={<WalletOutlined />}
                  shape="default"
                  size="small"
                  onClick={onWithdraw}
                />
              </Popover>
            )}
            <Popover
              content="Delete the Validator only if the node stops or Node from Provider"
              placement="bottom"
            >
              <IconButton
                title="Delete"
                disabled={!actions[ActionTxType.remove]}
                icon={<DeleteOutlined />}
                shape="default"
                size="small"
                danger
                onClick={onRemove}
              />
            </Popover>
          </Flex>
        </Flex>
      )
    },
    shouldCellUpdate: (record, prevRecord) =>
      record.coordinatorStatus !== prevRecord.coordinatorStatus ||
      record.validatorStatus !== prevRecord.validatorStatus ||
      record.node?.coordinatorStatus !== prevRecord.node?.coordinatorStatus ||
      record.node?.coordinatorValidatorStatus !== prevRecord.node?.coordinatorValidatorStatus ||
      record.node?.validatorStatus !== prevRecord.node?.validatorStatus
  }
]
