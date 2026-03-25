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
import { Worker } from '@renderer/types/workers'
import { WorkersListTable } from '@renderer/components/Workers/WorkersListTable/Table'
import { Flex } from '@renderer/ui-kit/Flex'
import { ButtonPrimary } from '@renderer/ui-kit/Button'
import { useGoWorker } from '@renderer/hooks/workers'
import React, { useState, useCallback, useEffect, useMemo, useDeferredValue } from 'react'
import { ActionTxType } from '../../types/workers'
import { ActionModal } from './ActionModal'
import { MassActionModal } from './MassActionModal'
import { routes } from '@renderer/constants/navigation'
import { IconButton } from '@renderer/ui-kit/Button'
import { Text } from '@renderer/ui-kit/Typography'
import { LiveValue } from '@renderer/ui-kit/LiveValue'
import {
  CloseOutlined,
  CaretRightOutlined,
  WalletOutlined,
  DeleteOutlined,
  CheckSquareOutlined
} from '@ant-design/icons'
import { keyframes, styled } from 'styled-components'
import { getById, getAll, getAllByNodeId } from '../../api/worker'
import { useGetStats } from '../../hooks/workers'
import { Node } from '../../types/node'
import { Empty } from '@renderer/ui-kit/Empty'
import { Popover } from '@renderer/ui-kit/Popover'
import { useMonitoringInterval } from '@renderer/hooks/settings'

type WorkersListPropsT = {
  data?: Worker[]
  shouldAddNode?: boolean
  total?: number
  page?: number
  pageSize?: number
  onPageChange?: (page: number, pageSize: number) => void
  nodeId?: number | bigint // For filtering by node
  nodes?: Node[] // For converting node names to nodeIds in filters
  onDataChange?: (filters: {
    status?: string[]
    nodeId?: (number | bigint)[]
    rewardMin?: number
    rewardMax?: number
  }) => void // Callback to update parent data query
  onActiveFilterValuesChange?: (activeFilterValues: {
    status?: string[]
    node?: string[]
    reward?: { min?: number; max?: number }
  }) => void // Callback to update parent activeFilterValues
  activeFilterValues?: {
    status?: string[]
    node?: string[]
    reward?: { min?: number; max?: number }
  } // Active filter values from parent
  filters?: {
    status?: string[]
    nodeId?: (number | bigint)[]
    rewardMin?: number
    rewardMax?: number
  } // Filters from parent
}

export const WorkersList: React.FC<WorkersListPropsT> = ({
  shouldAddNode,
  data,
  total = 0,
  page = 1,
  pageSize = 100,
  onPageChange,
  nodeId,
  nodes,
  onDataChange,
  onActiveFilterValuesChange,
  activeFilterValues: activeFilterValuesProp,
  filters: filtersProp
}) => {
  const deferredData = useDeferredValue(data)
  const monitoringInterval = useMonitoringInterval()
  const { goView } = useGoWorker()
  // Use filters from parent if provided, otherwise use local state
  const [localFilters, setLocalFilters] = useState<{
    status?: string[]
    nodeId?: (number | bigint)[]
    rewardMin?: number
    rewardMax?: number
  }>({})
  const filters = filtersProp ?? localFilters
  // Use activeFilterValues from parent if provided, otherwise use local state
  const [localActiveFilterValues, setLocalActiveFilterValues] = useState<{
    status?: string[]
    node?: string[]
    reward?: { min?: number; max?: number }
  }>({})
  const activeFilterValues = activeFilterValuesProp ?? localActiveFilterValues

  // Update parent when activeFilterValues change (if callback provided)
  useEffect(() => {
    if (onActiveFilterValuesChange && activeFilterValues) {
      onActiveFilterValuesChange(activeFilterValues)
    }
  }, [activeFilterValues, onActiveFilterValuesChange])

  // Load statistics from server
  const { data: stats } = useGetStats({
    refetchInterval: monitoringInterval,
    nodeId,
    filters
  })

  const [actionModal, setActionModal] = useState<{
    action: null | ActionTxType
    workerId: undefined | string
  }>({ action: null, workerId: undefined })
  const [massActionModal, setMassActionModal] = useState<{
    action: null | ActionTxType
    workers: Worker[]
  }>({ action: null, workers: [] })
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<Set<number | bigint>>(new Set())
  const [isSelectAll, setIsSelectAll] = useState(false)

  const onActionModalChange = (action: null | ActionTxType, workerId: undefined | string) =>
    setActionModal({ action, workerId })

  const onMassSelect = useCallback((selectedRowKeys: (number | bigint)[]) => {
    setSelectedWorkerIds(new Set(selectedRowKeys))
    setIsSelectAll(false)
  }, [])

  const handleSelectAll = useCallback(async () => {
    if (isSelectAll) {
      setSelectedWorkerIds(new Set())
      setIsSelectAll(false)
    } else {
      // Mark as "select all" - when opening mass action modal, we'll load all workers
      const allIds = new Set<number | bigint>()
      if (deferredData) {
        deferredData.forEach((worker) => allIds.add(worker.id))
      }
      setSelectedWorkerIds(allIds)
      setIsSelectAll(true)
    }
  }, [isSelectAll, deferredData])

  const loadSelectedWorkers = useCallback(
    async (
      ids: (number | bigint)[],
      selectAll: boolean,
      filters?: { status?: string[]; nodeId?: (number | bigint)[] }
    ): Promise<Worker[]> => {
      if (selectAll) {
        // For select all, load all workers with current filters applied
        // This is needed for getMassFromAddress calculation
        // If nodeId is provided, load only workers for that node
        if (nodeId) {
          const result = await getAllByNodeId(nodeId, undefined, undefined, filters)
          return result.data
        } else {
          const result = await getAll(undefined, undefined, filters)
          return result.data
        }
      } else {
        const workers = await Promise.all(ids.map((id) => getById(id)))
        return workers.filter((w) => w !== null) as Worker[]
      }
    },
    [nodeId]
  )

  const handleMassAction = useCallback(
    async (action: ActionTxType) => {
      const ids = Array.from(selectedWorkerIds)
      if (ids.length === 0 && !isSelectAll) return

      // Load workers for getMassFromAddress calculation
      // For select all, load all workers with current filters
      const workers = await loadSelectedWorkers(ids, isSelectAll, filters)
      setMassActionModal({ action, workers })
    },
    [selectedWorkerIds, isSelectAll, loadSelectedWorkers, filters]
  )

  const handleFiltersChange = useCallback(
    (newFilters: {
      status?: string[]
      node?: string[]
      reward?: { min?: number; max?: number }
    }) => {
      // Store active filter values for table display immediately
      if (onActiveFilterValuesChange) {
        onActiveFilterValuesChange(newFilters)
      } else {
        setLocalActiveFilterValues(newFilters)
      }

      // Convert node names to nodeIds if needed
      const nodeIds = newFilters.node
        ?.map((nodeName) => {
          const node =
            nodes?.find((n) => n.name === nodeName) ||
            deferredData?.find((w) => w.node?.name === nodeName)?.node
          return node?.id
        })
        .filter((id) => id !== undefined) as (number | bigint)[] | undefined

      const updatedFilters = {
        status: newFilters.status,
        nodeId: nodeIds,
        rewardMin: newFilters.reward?.min,
        rewardMax: newFilters.reward?.max
      }

      // Update filters - use parent's callback if provided, otherwise local state
      if (onDataChange) {
        onDataChange(updatedFilters)
      } else {
        setLocalFilters(updatedFilters)
      }
    },
    [deferredData, nodes, onActiveFilterValuesChange, onDataChange]
  )

  useEffect(() => {
    if (massActionModal.action === null && massActionModal.workers.length === 0) {
      setSelectedWorkerIds(new Set())
      setIsSelectAll(false)
    }
  }, [massActionModal.action])

  const tableFilters = useMemo(
    () =>
      stats
        ? {
            status: Object.keys(stats.filters.status).map((key) => ({
              text: `${key}(${stats.filters.status[key]})`,
              value: key
            })),
            node: Object.keys(stats.filters.node).map((key) => ({
              text: `${key}(${stats.filters.node[key]})`,
              value: key
            }))
          }
        : undefined,
    [stats]
  )
  const selectedRowKeys = useMemo(() => Array.from(selectedWorkerIds), [selectedWorkerIds])

  if (shouldAddNode)
    return (
      <Empty description={<span>Nothing to display here. Please add your first Node</span>}>
        <Flex justify="center">
          <ButtonPrimary href={routes.nodes.create}>Add Node</ButtonPrimary>
        </Flex>
      </Empty>
    )
  if (!deferredData?.length)
    return (
      <Empty description={<span>Nothing to display here. Please add your Validators</span>}></Empty>
    )

  const selectedCount = isSelectAll ? total : selectedWorkerIds.size

  return (
    <>
      <MassAction gap={6}>
        <Popover content="Select all validators" placement="bottom">
          <IconButton
            icon={<CheckSquareOutlined />}
            shape="default"
            size="small"
            onClick={handleSelectAll}
            type={isSelectAll ? 'primary' : 'default'}
          />
        </Popover>
        <Popover
          content="Activate the Validator only if the node runs or node from Provider"
          placement="bottom"
        >
          <IconButton
            disabled={selectedCount === 0}
            icon={<CaretRightOutlined />}
            shape="default"
            size="small"
            onClick={() => handleMassAction(ActionTxType.activate)}
          />
        </Popover>
        <Popover
          content="Deactivate the Validator only if the Node runs and syncs or Node from Provider"
          placement="bottom"
        >
          <IconButton
            disabled={selectedCount === 0}
            icon={<CloseOutlined />}
            shape="default"
            size="small"
            onClick={() => handleMassAction(ActionTxType.deActivate)}
          />
        </Popover>
        <Popover
          content="Withdraw the Validator only if the Node runs and syncs or Node from Provider"
          placement="bottom"
        >
          <IconButton
            disabled={selectedCount === 0}
            icon={<WalletOutlined />}
            shape="default"
            size="small"
            onClick={() => handleMassAction(ActionTxType.withdraw)}
          />
        </Popover>
        <Popover
          content="Delete the Validators only if the node stops or node from Provider"
          placement="bottom"
        >
          <IconButton
            disabled={selectedCount === 0}
            icon={<DeleteOutlined />}
            shape="default"
            size="small"
            onClick={() => handleMassAction(ActionTxType.remove)}
            danger
          />
        </Popover>
        <SelectedCount>
          Selected: <LiveValue value={selectedCount}>{selectedCount}</LiveValue>
        </SelectedCount>
      </MassAction>
      <WorkersListTable
        data={deferredData}
        filters={tableFilters}
        rewardAmount={stats?.rewardAmount || 0}
        onRowClick={goView}
        onAction={onActionModalChange}
        onSelect={onMassSelect}
        pagination={
          onPageChange
            ? {
                current: page,
                pageSize: pageSize,
                total: total,
                onChange: onPageChange
              }
            : undefined
        }
        selectedRowKeys={selectedRowKeys}
        onFiltersChange={handleFiltersChange}
        activeFilters={activeFilterValues || {}}
      />
      <ActionModal
        id={actionModal.workerId}
        type={actionModal.action}
        onClose={() => onActionModalChange(null, undefined)}
      />
      <MassActionModal
        workers={massActionModal.workers}
        type={massActionModal.action}
        onClose={() => setMassActionModal((prev) => ({ ...prev, action: null }))}
      />
    </>
  )
}

const toolbarReveal = keyframes`
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const MassAction = styled(Flex)`
  margin: 0 0 16px;
  align-items: center;
  animation: ${toolbarReveal} 180ms ease-out both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const SelectedCount = styled(Text)`
  margin-left: 8px;
  display: inline-flex;
  align-items: center;
`
