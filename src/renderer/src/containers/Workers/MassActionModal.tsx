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
import React, { useCallback } from 'react'
import { Input } from 'antd'
import { Modal } from '../../ui-kit/Modal'
import { Alert } from '../../ui-kit/Alert'
import { useMassAction } from '../../hooks/workers'
import { Text } from '@renderer/ui-kit/Typography'
import { styled } from 'styled-components'
import { Flex, Tooltip, Progress } from 'antd'
import { ActionTxType } from '../../types/workers'
import { Worker } from '@renderer/types/workers'
import { getMassFromAddress } from '../../helpers/workers'

type ActionModalProps = {
  type: ActionTxType | null
  onClose: () => void
  workers?: Worker[]
}

const getTitle = (type, count) => {
  if (type === ActionTxType.activate) {
    return `Mass Activate ${count} Validators`
  } else if (type === ActionTxType.deActivate) {
    return `Mass Deactivate ${count} Validators`
  } else if (type === ActionTxType.remove) {
    return `Mass Remove ${count} Validators`
  }

  return `Mass Withdraw ${count} Validators`
}
const getButtonTitle = (type, isClose) => {
  if (isClose) {
    return `Close`
  } else if (type === ActionTxType.activate) {
    return `Activate`
  } else if (type === ActionTxType.deActivate) {
    return `Deactivate`
  } else if (type === ActionTxType.remove) {
    return `Delete`
  }
  return `Withdraw`
}

export const MassActionModal: React.FC<ActionModalProps> = ({ type, workers, onClose }) => {
  const ids = workers ? workers.map((w) => w.id) : []
  const from = getMassFromAddress(type, workers || [])
  const {
    status,
    error,
    count,
    onRemove,
    onActivate,
    onDeActivate,
    onWithdraw,
    onClear,
    onChangePk,
    pk
  } = useMassAction(type, from)

  const handleClose = () => {
    onClear()
    onClose()
  }

  const handleOk = useCallback(async () => {
    if (count.success + count.failed === ids.length) {
      handleClose()
      return
    }

    if (type === ActionTxType.remove) {
      await onRemove(handleClose, ids)
    } else if (type === ActionTxType.activate) {
      await onActivate(ids)
    } else if (type === ActionTxType.deActivate) {
      await onDeActivate(ids)
    } else if (type === ActionTxType.withdraw) {
      await onWithdraw(ids)
    }
  }, [type, ids, onRemove, onActivate, onDeActivate, onWithdraw, handleClose, count])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChangePk(e.target.value, workers && workers.length > 0 ? workers[0].nodeId : null)

  if (!type || !ids || ids.length === 0) {
    return null
  }
  let disabled = true
  if (type === ActionTxType.remove) {
    disabled = false
  } else {
    disabled = true
    if (pk) {
      try {
        if (type === ActionTxType.withdraw || type === ActionTxType.deActivate) {
          disabled = !from || !from.includes(pk.address.toLowerCase()) || pk.hasPendingTransactions
        } else {
          disabled = pk.hasPendingTransactions
        }
      } catch {
        disabled = true
      }
    }
  }
  const okButtonProps = { disabled }
  const okRemoveButtonProps = { danger: true, disabled }
  return (
    <Modal
      title={getTitle(type, ids.length)}
      open={!!type}
      confirmLoading={status}
      okButtonProps={type === ActionTxType.remove ? okRemoveButtonProps : okButtonProps}
      okText={getButtonTitle(type, count.success + count.failed === ids.length)}
      onOk={handleOk}
      onCancel={handleClose}
      width={800}
    >
      {error ? (
        <Alert message={error} type="error" />
      ) : (
        <div>
          {type === ActionTxType.remove && (
            <Alert message="Are you sure you want to remove this Validators?" type="error" />
          )}
          {from === null && (
            <Alert message="You have selected incompatible Validators" type="error" />
          )}

          {from !== null && type !== ActionTxType.remove && type !== ActionTxType.activate && (
            <TextRow label="From" value={from.join(', ')} />
          )}

          {type !== ActionTxType.remove && (
            <PKStyle>
              <StyledInput
                placeholder="Type Private Key here"
                onChange={onChange}
                value={pk.key}
                type="password"
                status={pk.isCorrect === false ? 'error' : ''}
              />
              {pk.isCorrect === false && (
                <Text color="red" size="sm">
                  Incorrect Private Key
                </Text>
              )}
              {pk.address && <TextRow label="Address" value={pk.address} type="small" />}
              {pk.balance && <TextRow label="Balance" value={`${pk.balance} WATER`} type="small" />}
              {pk.hasPendingTransactions && (
                <WarningText color="red" size="sm">
                  Please wait for previous transactions to complete before sending new ones
                </WarningText>
              )}
            </PKStyle>
          )}
          {(count.success > 0 || count.failed > 0 || status) && (
            <>
              <Tooltip
                title={`${count.success} success / ${count.failed} failed / ${ids.length - count.success - count.failed} in queue`}
              >
                <Progress
                  strokeColor={'red'}
                  type="line"
                  size={[400, 10]}
                  percent={Math.round(((count.success + count.failed) * 100) / ids.length)}
                  success={{ percent: Math.round((count.success * 100) / ids.length) }}
                />
              </Tooltip>
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
  type?: 'small' | 'default'
}> = ({ label, value, type = 'default' }) => {
  return (
    <TextItem gap={6} align="center" type={type}>
      <TextLabel>{label}:</TextLabel>
      <TextValue>{value}</TextValue>
    </TextItem>
  )
}

const TextLabel = styled(Text)`
  min-width: 100px;
`
const TextValue = styled(Text)`
  width: 100%;
`

const TextItem = styled(Flex)<{ type: 'small' | 'default' }>`
  margin-bottom: ${({ type }) => (type === 'small' ? 5 : 20)}px;
  margin-top: ${({ type }) => (type === 'small' ? 0 : 20)}px;
`
const StyledInput = styled(Input)`
  margin-top: 20px;
  width: 100%;
  max-width: 360px;
`

const PKStyle = styled(Flex).attrs({ vertical: true })`
  margin-top: 20px;
  margin-bottom: 20px;
`

const WarningText = styled(Text)`
  margin-top: 5px;
`
