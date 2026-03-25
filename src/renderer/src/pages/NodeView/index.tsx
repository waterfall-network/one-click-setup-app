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
import { useMemo, useState } from 'react'
import { PageBody } from '@renderer/components/Page/Body'
import { PageHeader } from '@renderer/components/Page/Header'
import { Flex } from '@renderer/ui-kit/Flex'
import { Layout } from '@renderer/ui-kit/Layout'
import { IconButton } from '@renderer/ui-kit/Button'
import { Popover } from '@renderer/ui-kit/Popover'
import {
  PauseOutlined,
  CaretRightOutlined,
  ReloadOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import { Tabs } from '@renderer/ui-kit/Tabs'
import { Alert } from '@renderer/ui-kit/Alert'
import { NodeViewInformation } from '@renderer/containers/Node/NodeViewInformation'
import { NodeViewCoordinator } from '@renderer/containers/Node/NodeViewCoordinator'
import { NodeViewValidator } from '@renderer/containers/Node/NodeViewValidator'
import { NodeViewWorkers } from '@renderer/containers/Node/NodeViewWorkers'
import { NodeViewStatistics } from '@renderer/containers/Node/NodeViewStatistics'
import { useGetById, useControl } from '@renderer/hooks/node'
import { useMonitoringInterval } from '@renderer/hooks/settings'
import { Node, DownloadStatus, Action, Type } from '@renderer/types/node'
import { getActions } from '@renderer/helpers/node'
import { getViewLink } from '@renderer/helpers/navigation'
import { routes } from '@renderer/constants/navigation'
import { RemoveModal } from '../../containers/Node/RemoveModal'

const getTabs = (node?: Node) => {
  let tabs = [
    {
      label: 'Main Information',
      children: <NodeViewInformation item={node} />,
      key: '1',
      closable: false
    }
  ]

  if (node && node.type === Type.local) {
    tabs = [
      ...tabs,
      ...[
        {
          label: 'Coordinator Layer',
          children: <NodeViewCoordinator item={node} />,
          key: '2',
          closable: false
        },
        {
          label: 'Verifier Layer',
          children: <NodeViewValidator item={node} />,
          key: '3',
          closable: false
        }
      ]
    ]
  }
  tabs = [
    ...tabs,
    ...[
      {
        label: 'Validators',
        children: <NodeViewWorkers item={node} />,
        key: '4',
        closable: false
      },
      {
        label: 'Statistics',
        children: <NodeViewStatistics item={node} />,
        key: '5',
        closable: false
      }
    ]
  ]
  return tabs
}

export const NodeViewPage = () => {
  const nodeId = useParams()?.id
  const [removeId, setRemoveId] = useState<string | undefined>(undefined)
  const [activeKey, setActiveKey] = useState('1')
  const monitoringInterval = useMonitoringInterval()
  const {
    isLoading,
    data: node,
    error
  } = useGetById(nodeId, {
    refetchInterval: monitoringInterval
  })
  const { onStop, onRestart, onStart, status } = useControl(nodeId)

  const tabs = useMemo(() => getTabs(node), [node])
  const onTabChange = (newActiveKey: string) => setActiveKey(newActiveKey)

  const actions = getActions(node)
  const breadcrumb = [
    {
      title: 'Nodes',
      link: getViewLink(routes.nodes.list)
    },
    {
      title: node ? node.name : `Node #${nodeId}`
    }
  ]

  return (
    <Layout>
      <PageHeader
        breadcrumb={breadcrumb}
        actions={
          <Flex dir="row" gap={6}>
            {actions[Action.stop] && (
              <Popover content="Stop" placement="bottom">
                <IconButton
                  icon={<PauseOutlined />}
                  shape="default"
                  size="middle"
                  onClick={onStop}
                  loading={status ? status === 'stop' : false}
                />
              </Popover>
            )}
            {actions[Action.start] && (
              <Popover content="Run" placement="bottom">
                <IconButton
                  icon={<CaretRightOutlined />}
                  shape="default"
                  size="middle"
                  onClick={onStart}
                  loading={status ? status === 'start' : false}
                />
              </Popover>
            )}
            {actions[Action.restart] && (
              <Popover content="Restart" placement="bottom">
                <IconButton
                  icon={<ReloadOutlined />}
                  shape="default"
                  size="middle"
                  onClick={onRestart}
                  loading={status ? status === 'restart' : false}
                />
              </Popover>
            )}
            <Popover
              content={
                node && node.downloadStatus === DownloadStatus.finish
                  ? node.workersCount > 0
                    ? 'To remove a node, delete all validators first'
                    : 'Delete the Node only if the node stops'
                  : 'Delete the Node only if the download stops'
              }
              placement="bottom"
            >
              <IconButton
                disabled={!actions[Action.remove]}
                icon={<DeleteOutlined />}
                shape="default"
                size="middle"
                danger
                onClick={() => setRemoveId(nodeId)}
              />
            </Popover>
          </Flex>
        }
      />
      <PageBody isLoading={isLoading}>
        {error && <Alert title={error.message} type="error" />}
        <Tabs items={tabs} onChange={onTabChange} activeKey={activeKey} />
        <RemoveModal
          id={removeId}
          onClose={() => setRemoveId(undefined)}
          isRemoveFolder={node && node.type === Type.local}
        />
      </PageBody>
    </Layout>
  )
}
