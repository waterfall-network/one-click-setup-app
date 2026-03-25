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
import React, { useState } from 'react'
import { NodeViewTabProps, Type as NodeType } from '@renderer/types/node'
import { TabContent } from '@renderer/ui-kit/Tabs'
import { Flex } from '@renderer/ui-kit/Flex'
import { ImportOutlined, PlusOutlined } from '@ant-design/icons'
import { Alert } from '@renderer/ui-kit/Alert'
import { ButtonPrimary } from '@renderer/ui-kit/Button'
import { addParams } from '@renderer/helpers/navigation'
import { routes } from '@renderer/constants/navigation'
import { WorkersList } from '@renderer/containers/Workers/WorkersList'
import { useGetAllByNodeId } from '../../hooks/workers'
import { useMonitoringInterval } from '@renderer/hooks/settings'
import { keyframes, styled } from 'styled-components'
import { SearchKeys } from '../../constants/navigation'
import { Spin } from '@renderer/ui-kit/Spin'

export const NodeViewWorkers: React.FC<NodeViewTabProps> = ({ item }) => {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(100)
  const monitoringInterval = useMonitoringInterval()
  const [filters, setFilters] = useState<{
    status?: string[]
    nodeId?: (number | bigint)[]
    rewardMin?: number
    rewardMax?: number
  }>({})
  const [activeFilterValues, setActiveFilterValues] = useState<{
    status?: string[]
    node?: string[]
    reward?: { min?: number; max?: number }
  }>({})
  const { isLoading, data, total, error } = useGetAllByNodeId(item?.id.toString(), {
    refetchInterval: monitoringInterval,
    page,
    limit: pageSize,
    filters
  })
  const shouldAddNode = false

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleFiltersChange = (newFilters: {
    status?: string[]
    nodeId?: (number | bigint)[]
    rewardMin?: number
    rewardMax?: number
  }) => {
    setFilters(newFilters)
    setPage(1) // Reset to first page when filters change
  }

  const handleActiveFilterValuesChange = (newActiveFilterValues: {
    status?: string[]
    node?: string[]
    reward?: { min?: number; max?: number }
  }) => {
    setActiveFilterValues(newActiveFilterValues)
  }

  if (isLoading)
    return (
      <TabContent variant="table">
        <Spin tip="Loading" size="large">
          <LoadingPlaceholder />
        </Spin>
      </TabContent>
    )
  return (
    <TabContent variant="table">
      {item && (
        <Actions align="center" justify="flex-end" gap={10}>
          {(data?.length === 0 || item.type === NodeType.provider) && (
            <ButtonPrimary
              href={addParams(routes.workers.add, {
                [SearchKeys.node]: item?.id.toString(),
                [SearchKeys.mode]: 'import',
                [SearchKeys.step]: '1'
              })}
            >
              Import Validator <ImportOutlined />
            </ButtonPrimary>
          )}

          {item.type === NodeType.local && (
            <ButtonPrimary
              href={addParams(routes.workers.add, {
                [SearchKeys.node]: item?.id.toString(),
                [SearchKeys.step]: '1'
              })}
            >
              Add Validator <PlusOutlined />
            </ButtonPrimary>
          )}
        </Actions>
      )}
      {error && <Alert title={error.message} type="error" />}
      <WorkersList
        shouldAddNode={shouldAddNode}
        data={data}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        nodeId={item?.id}
        onDataChange={handleFiltersChange}
        onActiveFilterValuesChange={handleActiveFilterValuesChange}
        activeFilterValues={activeFilterValues}
        filters={filters}
      />
    </TabContent>
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

const Actions = styled(Flex)`
  margin-bottom: 10px;
  animation: ${toolbarReveal} 180ms ease-out both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const LoadingPlaceholder = styled.div`
  min-height: 320px;
`
