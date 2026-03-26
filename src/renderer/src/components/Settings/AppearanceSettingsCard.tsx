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
import { ThemeMode } from '@renderer/types/settings'
import { Card } from '@renderer/ui-kit/Card'
import { RadioButton, RadioGroup } from '@renderer/ui-kit/Radio'
import { Text } from '@renderer/ui-kit/Typography'
import { styled } from 'styled-components'

interface AppearanceSettingsCardProps {
  theme: ThemeMode
  onThemeChange: (theme: ThemeMode) => void
}

export const AppearanceSettingsCard = ({ theme, onThemeChange }: AppearanceSettingsCardProps) => {
  return (
    <Card title="Appearance">
      <Container>
        <Label>Theme</Label>
        <RadioGroup
          value={theme}
          onChange={(event) => {
            onThemeChange(event.target.value as ThemeMode)
          }}
        >
          <ButtonsRow>
            <RadioButton value="light">Light</RadioButton>
            <RadioButton value="dark">Dark</RadioButton>
            <RadioButton value="system">System</RadioButton>
          </ButtonsRow>
        </RadioGroup>
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

const ButtonsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const Label = styled(Text)`
  font-weight: 600;
`
