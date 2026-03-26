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
import { Card } from '@renderer/ui-kit/Card'
import { Switch } from '@renderer/ui-kit/Switch'
import { Text } from '@renderer/ui-kit/Typography'
import { styled } from 'styled-components'

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
      <Container>
        <Row>
          <Text>Open app at system login</Text>
          <Switch checked={autoStartApp} onChange={onAutoStartAppChange} />
        </Row>

        <Row>
          <Text>Start all nodes on app launch</Text>
          <Switch checked={autoStartNodes} onChange={onAutoStartNodesChange} />
        </Row>
      </Container>
    </Card>
  )
}

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Row = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`
