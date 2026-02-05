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
import React, { useCallback, useState } from 'react'
import { Modal } from '../../ui-kit/Modal'
import { Alert } from '../../ui-kit/Alert'
import { useActionTx, useRemove } from '../../hooks/workers'
import { useCopy } from '../../hooks/common'
import { Button, Spin, Input, Space } from 'antd'
import { Text } from '@renderer/ui-kit/Typography'
import { styled } from 'styled-components'
import { Flex } from 'antd'
import { ActionTxType } from '../../types/workers'

type ActionModalProps = {
  type: ActionTxType | null
  onClose: () => void
  id?: string
}

const getTitle = (type, id) => {
  if (type === ActionTxType.activate) {
    return `Activate Validator #${id}`
  } else if (type === ActionTxType.deActivate) {
    return `Deactivate Validator #${id}`
  } else if (type === ActionTxType.remove) {
    return `Remove Validator #${id}`
  }

  return `Withdraw Validator #${id}`
}

const okButtonProps = {}
const okRemoveButtonProps = { danger: true }
export const ActionModal: React.FC<ActionModalProps> = ({ type, id, onClose }) => {
  const [amount, setAmount] = useState('0')

  const { data, isLoading, error, onUpdate } = useActionTx(type, id)
  const { status: removeStatus, onRemove } = useRemove(id)

  const [copyFromStatus, handleFromCopy] = useCopy(data?.from)
  const [copyToStatus, handleToCopy] = useCopy(data?.to)
  const [copyValueStatus, handleValueCopy] = useCopy(data?.value?.toString())
  const [copyDataStatus, handleDataCopy] = useCopy(data?.hexData)

  const handleUpdate = useCallback(() => {
    onUpdate(amount)
  }, [amount])

  if (!type || !id) {
    return null
  }
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)

  const handleClose = () => {
    if (type === ActionTxType.withdraw) {
      setAmount('0')
    }
    onClose()
  }

  let handleOk = handleClose
  if (type === ActionTxType.remove) {
    handleOk = async () => {
      await onRemove(handleClose)
    }
  }

  return (
    <Modal
      title={getTitle(type, id)}
      open={!!type}
      confirmLoading={removeStatus}
      okButtonProps={type === ActionTxType.remove ? okRemoveButtonProps : okButtonProps}
      okText={type === ActionTxType.remove ? 'Delete' : 'OK'}
      onOk={handleOk}
      onCancel={handleClose}
      width={800}
    >
      {isLoading ? (
        <Spin tip="Loading" size="large">
          <div className="content" />
        </Spin>
      ) : error ? (
        <Alert title={error.message} type="error" />
      ) : (
        <div>
          {type === ActionTxType.remove && (
            <Alert title="Are you sure you want to remove this Validator?" type="error" />
          )}

          {type === ActionTxType.withdraw && (
            <TextRow
              label="Amount"
              value={
                <Flex align="center" gap={12}>
                  <Space.Compact>
                    <StyledInput
                      placeholder="Type Amount here"
                      onChange={onChange}
                      value={amount}
                    />
                    <Button type="primary" onClick={handleUpdate}>
                      Update
                    </Button>
                  </Space.Compact>
                </Flex>
              }
            />
          )}

          {(type === ActionTxType.deActivate || type === ActionTxType.withdraw) && (
            <TextRow
              label="From"
              value={data?.from}
              actions={
                <Button type="dashed" onClick={handleFromCopy}>
                  {copyFromStatus ? 'Copied' : 'Copy'}
                </Button>
              }
            />
          )}
          {(type === ActionTxType.activate ||
            type === ActionTxType.deActivate ||
            type === ActionTxType.withdraw) && (
            <>
              <TextRow
                label="To"
                value={data?.to}
                actions={
                  <Button type="dashed" onClick={handleToCopy}>
                    {copyToStatus ? 'Copied' : 'Copy'}
                  </Button>
                }
              />
              <TextRow
                label="Value"
                value={data?.value?.toString()}
                actions={
                  <Button type="dashed" onClick={handleValueCopy}>
                    {copyValueStatus ? 'Copied' : 'Copy'}
                  </Button>
                }
              />
              <TextRow
                label="Data"
                value={data?.hexData}
                actions={
                  <Button type="dashed" onClick={handleDataCopy}>
                    {copyDataStatus ? 'Copied' : 'Copy'}
                  </Button>
                }
              />
            </>
          )}
        </div>
      )}
    </Modal>
  )
}

export const TextRow: React.FC<{
  label: string
  value?: string | number | React.ReactNode
  actions?: React.ReactNode
}> = ({ label, value, actions }) => {
  return (
    <TextItem gap={6} align="center">
      <TextLabel>{label}:</TextLabel>
      <TextValue>{value}</TextValue>
      <Actions align="center" justify="center">
        {actions}
      </Actions>
    </TextItem>
  )
}

const TextLabel = styled(Text)`
  min-width: 70px;
`
const TextValue = styled(Text)`
  width: 100%;
`

const TextItem = styled(Flex)`
  margin-bottom: 20px;
`
const StyledInput = styled(Input)`
  width: 100%;
  max-width: 360px;
`
const Actions = styled(Flex)`
  min-width: 80px;
`
