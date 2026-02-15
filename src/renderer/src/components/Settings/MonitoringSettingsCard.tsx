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
import { Card, Slider, Space, Typography } from 'antd'

interface MonitoringSettingsCardProps {
  monitoringInterval: number
  intervalMin: number
  intervalMax: number
  onIntervalChange: (value: number) => void
  onIntervalCommit: (value: number) => void
}

export const MonitoringSettingsCard = ({
  monitoringInterval,
  intervalMin,
  intervalMax,
  onIntervalChange,
  onIntervalCommit
}: MonitoringSettingsCardProps) => {
  return (
    <Card title="Monitoring">
      <Space orientation="vertical" size={12} style={{ width: '100%' }}>
        <Typography.Text>
          Status polling interval: {Math.round(monitoringInterval / 1000)} sec
        </Typography.Text>
        <Slider
          min={intervalMin}
          max={intervalMax}
          step={1000}
          value={monitoringInterval}
          marks={{ 5000: '5s', 30000: '30s', 60000: '60s' }}
          onChange={(value) => {
            if (typeof value === 'number') {
              onIntervalChange(value)
            }
          }}
          onAfterChange={(value) => {
            if (typeof value === 'number') {
              onIntervalCommit(value)
            }
          }}
        />
      </Space>
    </Card>
  )
}
