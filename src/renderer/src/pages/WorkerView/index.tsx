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
import { useMemo, useState } from 'react'
import { PageBody } from '@renderer/components/Page/Body'
import { PageHeader } from '@renderer/components/Page/Header'
import { Flex, Layout, Popover } from 'antd'
import { IconButton } from '@renderer/ui-kit/Button'
import {
  CloseOutlined,
  CaretRightOutlined,
  WalletOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import { Tabs } from '@renderer/ui-kit/Tabs'
import { Alert } from '@renderer/ui-kit/Alert'
import { WorkerViewStatistics } from '@renderer/containers/Workers/WorkerViewStatistics'
import { WorkerViewValidator } from '@renderer/containers/Workers/WorkerViewValidator'
import { WorkerViewCoordinator } from '@renderer/containers/Workers/WorkerViewCoordinator'
import { WorkerViewInformation } from '@renderer/containers/Workers/WorkerViewInformation'
import { WorkerViewDelegateRules } from '@renderer/containers/Workers/WorkerViewDelegateRules'
import { useGetById } from '../../hooks/workers'
import { getViewLink } from '@renderer/helpers/navigation'
import { routes } from '@renderer/constants/navigation'
import { getActions } from '../../helpers/workers'
import { Worker, ActionTxType } from '../../types/workers'
import { ActionModal } from '../../containers/Workers/ActionModal'
import { Status as NodeStatus, Type as NodeType } from '../../types/node'
import { getNodeStatus } from '../../helpers/node'

const getTabs = (worker?: Worker) => {
  let tabs = [
    {
      label: 'Main Information',
      children: <WorkerViewInformation item={worker} />,
      key: '1',
      closable: false
    },
    {
      label: 'Coordinator',
      children: <WorkerViewCoordinator item={worker} />,
      key: '2',
      closable: false
    },
    {
      label: 'Verifier',
      children: <WorkerViewValidator item={worker} />,
      key: '3',
      closable: false
    }
  ]

  if (worker?.delegate) {
    tabs = [
      ...tabs,
      ...[
        {
          label: 'Delegate Rules',
          children: <WorkerViewDelegateRules item={worker} />,
          key: '4',
          closable: false
        }
      ]
    ]
  }

  tabs = [
    ...tabs,
    ...[
      {
        label: 'Statistics',
        children: <WorkerViewStatistics item={worker} />,
        key: '10',
        closable: false
      }
    ]
  ]

  return tabs
}

export const WorkerViewPage = () => {
  const workerId = useParams()?.id
  const [actionModal, setActionModal] = useState<null | ActionTxType>(null)
  const { isLoading, data: worker, error } = useGetById(workerId, { refetchInterval: 5000 })

  const tabs = useMemo(() => getTabs(worker), [worker])
  const [activeKey, setActiveKey] = useState(tabs[0].key)
  const onTabChange = (newActiveKey: string) => setActiveKey(newActiveKey)
  const onActionModalChange = (newActiveKey: null | ActionTxType) => setActionModal(newActiveKey)

  const breadcrumb = [
    {
      title: 'Validators',
      link: getViewLink(routes.nodes.list)
    },
    {
      title: `#${workerId}`
    }
  ]

  const actions = getActions(worker)
  return (
    <Layout>
      <PageHeader
        breadcrumb={breadcrumb}
        actions={
          <Flex dir="row" gap={6}>
            {actions[ActionTxType.activate] && (
              <Popover
                content={
                  worker?.node && worker?.node.type === NodeType.local
                    ? 'Activate the Validator only if the node runs and syncs'
                    : 'Activate the Validator only if the Providers node runs and syncs'
                }
                placement="bottom"
              >
                <IconButton
                  icon={<CaretRightOutlined />}
                  shape="default"
                  size="middle"
                  disabled={
                    worker?.node &&
                    worker?.node.type === NodeType.local &&
                    getNodeStatus(worker?.node) !== NodeStatus.running
                  }
                  onClick={() => onActionModalChange(ActionTxType.activate)}
                />
              </Popover>
            )}
            {actions[ActionTxType.deActivate] && (
              <Popover
                content={
                  worker?.node && worker?.node.type === NodeType.local
                    ? 'Deactivate the Validator only if the node runs and syncs'
                    : 'Deactivate the Validator only if the Providers node runs and syncs'
                }
                placement="bottom"
              >
                <IconButton
                  icon={<CloseOutlined />}
                  shape="default"
                  size="middle"
                  disabled={
                    worker?.node &&
                    worker?.node.type === NodeType.local &&
                    getNodeStatus(worker?.node) !== NodeStatus.running
                  }
                  onClick={() => onActionModalChange(ActionTxType.deActivate)}
                />
              </Popover>
            )}
            {actions[ActionTxType.withdraw] && (
              <Popover
                content={
                  worker?.node && worker?.node.type === NodeType.local
                    ? 'Withdraw the Validator only if the node runs and syncs'
                    : 'Withdraw the Validator only if the Providers node runs and syncs'
                }
                placement="bottom"
              >
                <IconButton
                  icon={<WalletOutlined />}
                  shape="default"
                  size="middle"
                  disabled={
                    worker?.node &&
                    worker?.node.type === NodeType.local &&
                    getNodeStatus(worker?.node) !== NodeStatus.running
                  }
                  onClick={() => onActionModalChange(ActionTxType.withdraw)}
                />
              </Popover>
            )}

            <Popover
              content={
                worker?.node && worker?.node.type === NodeType.local
                  ? 'Delete the Validator only if the node stops'
                  : 'Delete the Validator only if the Providers node stops'
              }
              placement="bottom"
            >
              <IconButton
                disabled={!actions[ActionTxType.remove]}
                icon={<DeleteOutlined />}
                shape="default"
                size="middle"
                danger
                onClick={() => onActionModalChange(ActionTxType.remove)}
              />
            </Popover>
          </Flex>
        }
      />
      <PageBody isLoading={isLoading}>
        {error && <Alert title={error.message} type="error" />}
        <Tabs items={tabs} onChange={onTabChange} activeKey={activeKey} />
        <ActionModal id={workerId} type={actionModal} onClose={() => onActionModalChange(null)} />
      </PageBody>
    </Layout>
  )
}
