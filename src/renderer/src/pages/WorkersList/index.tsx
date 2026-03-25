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
import { PageHeader } from '@renderer/components/Page/Header'
import { Flex } from '@renderer/ui-kit/Flex'
import { Layout } from '@renderer/ui-kit/Layout'
import { Alert } from '@renderer/ui-kit/Alert'
import { ButtonPrimary } from '@renderer/ui-kit/Button'
import { PlusCircleOutlined, ImportOutlined } from '@ant-design/icons'
import { PageBody } from '@renderer/components/Page/Body'
import { WorkersList } from '@renderer/containers/Workers/WorkersList'
import { routes } from '@renderer/constants/navigation'
import { useGetAll } from '@renderer/hooks/workers'
import { useGetAll as useGetAllNode } from '@renderer/hooks/node'
import { useMonitoringInterval } from '@renderer/hooks/settings'
import { SearchKeys } from '../../constants/navigation'
import { addParams } from '@renderer/helpers/navigation'
import { useState } from 'react'

export const WorkersListPage = () => {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(100)
  const monitoringInterval = useMonitoringInterval()
  const [filters, setFilters] = useState<{
    status?: string[]
    nodeId?: (number | bigint)[]
    rewardMin?: number
    rewardMax?: number
  }>({})
  // Store active filter values (status and node names) for table display
  const [activeFilterValues, setActiveFilterValues] = useState<{
    status?: string[]
    node?: string[]
    reward?: { min?: number; max?: number }
  }>({})
  const { isLoading, data, total, error } = useGetAll({
    refetchInterval: monitoringInterval,
    page,
    limit: pageSize,
    filters
  })
  const { data: nodes } = useGetAllNode()

  const breadcrumb = [
    {
      title: 'Validators'
    }
  ]

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

  return (
    <Layout>
      <PageHeader
        breadcrumb={breadcrumb}
        actions={
          <Flex align="center" gap={4}>
            {nodes && nodes?.find((node) => node.workersCount === 0) && (
              <ButtonPrimary
                href={addParams(routes.workers.add, {
                  [SearchKeys.mode]: 'import'
                })}
              >
                Import
                <ImportOutlined />
              </ButtonPrimary>
            )}
            {nodes && nodes.length > 0 && (
              <ButtonPrimary href={routes.workers.add}>
                Add
                <PlusCircleOutlined />
              </ButtonPrimary>
            )}
          </Flex>
        }
      />
      <PageBody isLoading={isLoading}>
        {error && <Alert title={error.message} type="error" />}
        <WorkersList
          shouldAddNode={nodes && nodes.length === 0}
          data={data}
          total={total}
          page={page}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onDataChange={handleFiltersChange}
          onActiveFilterValuesChange={handleActiveFilterValuesChange}
          activeFilterValues={activeFilterValues}
          filters={filters}
          nodes={nodes}
        />
      </PageBody>
    </Layout>
  )
}
