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
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons'
import { ButtonPrimary } from '@renderer/ui-kit/Button'
import { Card } from '@renderer/ui-kit/Card'
import { Text } from '@renderer/ui-kit/Typography'
import { styled } from 'styled-components'

interface BackupSettingsCardProps {
  onExport: () => void
  onImport: () => void
  exportLoading: boolean
  importLoading: boolean
}

export const BackupSettingsCard = ({
  onExport,
  onImport,
  exportLoading,
  importLoading
}: BackupSettingsCardProps) => {
  return (
    <Card title="Backup">
      <Container>
        <ButtonsRow>
          <ButtonPrimary icon={<DownloadOutlined />} onClick={onExport} loading={exportLoading}>
            Export config
          </ButtonPrimary>
          <ButtonPrimary icon={<UploadOutlined />} onClick={onImport} loading={importLoading}>
            Import config
          </ButtonPrimary>
        </ButtonsRow>
        <Hint size="sm">Import expects a JSON file exported from this application.</Hint>
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
  gap: 10px;
  flex-wrap: wrap;
`

const Hint = styled(Text)`
  color: ${({ theme }) => theme.palette.text.gray};
`
