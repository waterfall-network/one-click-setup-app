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
import { Card, Space, Switch, Typography } from 'antd'

interface StartupSettingsCardProps {
  autoStartApp: boolean
  autoStartNodes: boolean
  onAutoStartAppChange: (value: boolean) => void
  onAutoStartNodesChange: (value: boolean) => void
}

export const StartupSettingsCard = ({
  autoStartApp,
  autoStartNodes,
  onAutoStartAppChange,
  onAutoStartNodesChange
}: StartupSettingsCardProps) => {
  return (
    <Card title="Startup">
      <Space orientation="vertical" size={16} style={{ width: '100%' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Typography.Text>Open app at system login</Typography.Text>
          <Switch checked={autoStartApp} onChange={onAutoStartAppChange} />
        </Space>

        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Typography.Text>Start all nodes on app launch</Typography.Text>
          <Switch checked={autoStartNodes} onChange={onAutoStartNodesChange} />
        </Space>
      </Space>
    </Card>
  )
}
