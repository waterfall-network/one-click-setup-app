/*
 * Copyright 2026   Blue Wave Inc.
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
import { Card } from '@renderer/ui-kit/Card'
import { Slider } from '@renderer/ui-kit/Slider'
import { Text } from '@renderer/ui-kit/Typography'
import { Select } from '@renderer/ui-kit/Select'
import { ButtonPrimary } from '@renderer/ui-kit/Button'
import { DownloadOutlined } from '@ant-design/icons'
import { styled } from 'styled-components'
import { LogLevel } from '@renderer/types/settings'

interface MonitoringSettingsCardProps {
  monitoringInterval: number
  logLevel: LogLevel
  intervalMin: number
  intervalMax: number
  onIntervalChange: (value: number) => void
  onIntervalCommit: (value: number) => void
  onLogLevelChange: (value: LogLevel) => void
  onExportMainLog: () => void
  exportMainLogLoading: boolean
}

export const MonitoringSettingsCard = ({
  monitoringInterval,
  logLevel,
  intervalMin,
  intervalMax,
  onIntervalChange,
  onIntervalCommit,
  onLogLevelChange,
  onExportMainLog,
  exportMainLogLoading
}: MonitoringSettingsCardProps) => {
  return (
    <Card title="Monitoring">
      <Container>
        <Text>Status polling interval: {Math.round(monitoringInterval / 1000)} sec</Text>
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
        <Text>Log level</Text>
        <ControlsRow>
          <Select
            value={logLevel}
            style={{ width: 180 }}
            options={[
              { label: 'Debug', value: 'debug' },
              { label: 'Info', value: 'info' },
              { label: 'Warn', value: 'warn' },
              { label: 'Error', value: 'error' }
            ]}
            onChange={(value) => onLogLevelChange(value as LogLevel)}
          />
          <ButtonPrimary
            icon={<DownloadOutlined />}
            onClick={onExportMainLog}
            loading={exportMainLogLoading}
          >
            Save main.log
          </ButtonPrimary>
        </ControlsRow>
      </Container>
    </Card>
  )
}

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const ControlsRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`
