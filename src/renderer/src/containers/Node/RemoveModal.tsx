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
import React from 'react'
import { Modal } from '../../ui-kit/Modal'
import { Alert } from '../../ui-kit/Alert'
import { Title, Text } from '../../ui-kit/Typography'
import { useRemove } from '../../hooks/node'
import { Checkbox, type CheckboxProps } from '@renderer/ui-kit/Checkbox'

type RemoveModalProps = {
  onClose: () => void
  id?: string
  isRemoveFolder?: boolean
}
const okButtonProps = { danger: true }
export const RemoveModal: React.FC<RemoveModalProps> = ({ id, onClose, isRemoveFolder }) => {
  const { status: status, withData, onChangeWithData, onRemove, node } = useRemove(id)

  if (!id) {
    return null
  }

  const handleClose = () => {
    onClose()
  }

  const handleOk = async () => {
    await onRemove(handleClose)
  }

  const onChange: CheckboxProps['onChange'] = (e) => onChangeWithData(e.target.checked)

  return (
    <Modal
      title={`Remove Node #${id}`}
      open={!!id}
      confirmLoading={status}
      okButtonProps={okButtonProps}
      okText="Delete"
      onOk={handleOk}
      onCancel={handleClose}
      width={800}
    >
      <div>
        <Alert title="Are you sure you want to remove this Node?" type="error" />
        {isRemoveFolder && (
          <Title>
            <Checkbox onChange={onChange} checked={withData}>
              Delete data folder `
              <Text color="red" size="sm">
                {node?.locationDir}
              </Text>
              ` too
            </Checkbox>
          </Title>
        )}
      </div>
    </Modal>
  )
}
