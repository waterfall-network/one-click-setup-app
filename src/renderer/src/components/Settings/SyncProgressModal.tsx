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
import { Modal, Progress, Space, Typography } from 'antd'
import { ButtonPrimary } from '@renderer/ui-kit/Button'

export interface SyncProgressState {
  open: boolean
  mode: 'import' | 'export'
  status: 'running' | 'done' | 'error'
  percent: number
  message: string
  nodes: number
  validators: number
  exportPath: string | null
  importPath: string | null
}

interface SyncProgressModalProps {
  value: SyncProgressState
  onClose: () => void
}

export const SyncProgressModal = ({ value, onClose }: SyncProgressModalProps) => {
  return (
    <Modal
      open={value.open}
      title={value.mode === 'export' ? 'Export progress' : 'Import progress'}
      onCancel={() => {
        if (value.status !== 'running') {
          onClose()
        }
      }}
      closable={value.status !== 'running'}
      maskClosable={false}
      centered
      footer={
        value.status === 'running'
          ? null
          : [
              <ButtonPrimary key="close-progress" onClick={onClose}>
                Close
              </ButtonPrimary>
            ]
      }
    >
      <Space orientation="vertical" size={12} style={{ width: '100%' }}>
        <Progress
          percent={value.percent}
          status={
            value.status === 'error' ? 'exception' : value.status === 'done' ? 'success' : 'active'
          }
        />
        <Typography.Text>{value.message}</Typography.Text>
        {value.status !== 'running' && (
          <Typography.Text type="secondary">
            {value.mode === 'export' ? 'Exported' : 'Imported'} nodes: {value.nodes}, validators:{' '}
            {value.validators}
          </Typography.Text>
        )}
        {value.status === 'done' && value.mode === 'export' && value.exportPath && (
          <Typography.Text type="secondary">Exported to: {value.exportPath}</Typography.Text>
        )}
        {value.status === 'done' && value.mode === 'import' && value.importPath && (
          <Typography.Text type="secondary">Imported from: {value.importPath}</Typography.Text>
        )}
      </Space>
    </Modal>
  )
}
