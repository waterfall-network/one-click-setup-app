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
import { Space } from '@renderer/ui-kit/Space'
import { Flex } from '@renderer/ui-kit/Flex'
import { Button } from '@renderer/ui-kit/Button'
import { Text } from '@renderer/ui-kit/Typography'
import { keyframes, styled } from 'styled-components'
import { ActionTxType } from '../../types/workers'
import { Input } from '@renderer/ui-kit/Input'
import { Spin } from '@renderer/ui-kit/Spin'

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
          <LoadingPlaceholder />
        </Spin>
      ) : error ? (
        <Alert title={error.message} type="error" />
      ) : (
        <AnimatedContent>
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
        </AnimatedContent>
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

const contentReveal = keyframes`
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const AnimatedContent = styled.div`
  > * {
    animation: ${contentReveal} 180ms ease-out both;
  }

  > *:nth-child(1) {
    animation-delay: 0ms;
  }
  > *:nth-child(2) {
    animation-delay: 45ms;
  }
  > *:nth-child(3) {
    animation-delay: 90ms;
  }
  > *:nth-child(4) {
    animation-delay: 135ms;
  }
  > *:nth-child(5) {
    animation-delay: 180ms;
  }

  @media (prefers-reduced-motion: reduce) {
    > * {
      animation: none;
    }
  }
`

const LoadingPlaceholder = styled.div`
  min-height: 260px;
`
