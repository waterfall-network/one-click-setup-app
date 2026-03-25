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
import React, { useCallback } from 'react'
import { Modal } from '../../ui-kit/Modal'
import { Alert } from '../../ui-kit/Alert'
import { useMassAction } from '../../hooks/workers'
import { Text } from '@renderer/ui-kit/Typography'
import { keyframes, styled } from 'styled-components'
import { Flex } from '@renderer/ui-kit/Flex'
import { ActionTxType } from '../../types/workers'
import { Worker } from '@renderer/types/workers'
import { getMassFromAddress } from '../../helpers/workers'
import { Input } from '@renderer/ui-kit/Input'
import { Progress } from '@renderer/ui-kit/Progress'
import { Tooltip } from '@renderer/ui-kit/Tooltip'
import { useTheme } from 'styled-components'

type ActionModalProps = {
  type: ActionTxType | null
  onClose: () => void
  workers?: Worker[]
}

const getTitle = (type, count) => {
  if (type === ActionTxType.activate) {
    return `Bulk Activate (${count} validators)`
  } else if (type === ActionTxType.deActivate) {
    return `Bulk Deactivate (${count} validators)`
  } else if (type === ActionTxType.remove) {
    return `Bulk Delete (${count} validators)`
  }

  return `Bulk Withdraw (${count} validators)`
}

const getActionName = (type: ActionTxType) => {
  if (type === ActionTxType.activate) return 'Activate'
  if (type === ActionTxType.deActivate) return 'Deactivate'
  if (type === ActionTxType.remove) return 'Delete'
  return 'Withdraw'
}

const getButtonTitle = (type: ActionTxType, isClose: boolean) => {
  if (isClose) {
    return 'Close'
  }

  return getActionName(type)
}

export const MassActionModal: React.FC<ActionModalProps> = ({ type, workers, onClose }) => {
  const theme = useTheme()
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
        <Alert title={error} type="error" />
      ) : (
        <ModalBody>
          <AnimatedSection $delay={0}>
            <SummaryPanel>
              <SummaryRow>
                <SummaryLabel size="sm">Operation</SummaryLabel>
                <Text>{getActionName(type)}</Text>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel size="sm">Selected validators</SummaryLabel>
                <Text>{ids.length}</Text>
              </SummaryRow>
            </SummaryPanel>
          </AnimatedSection>

          {type === ActionTxType.remove && (
            <Alert title="Are you sure you want to delete the selected validators?" type="error" />
          )}
          {(type === ActionTxType.withdraw || type === ActionTxType.deActivate) &&
            from === null && (
              <Alert
                title="Selected validators are incompatible for this bulk action."
                type="error"
              />
            )}

          {from !== null && type !== ActionTxType.remove && type !== ActionTxType.activate && (
            <AnimatedSection $delay={1}>
              <SectionCard>
                <FieldLabel>From addresses</FieldLabel>
                <AddressList>
                  {from.map((address) => (
                    <AddressChip key={address}>{address}</AddressChip>
                  ))}
                </AddressList>
              </SectionCard>
            </AnimatedSection>
          )}

          {type !== ActionTxType.remove && (
            <AnimatedSection $delay={2}>
              <SectionCard>
                <FieldLabel>Signer private key</FieldLabel>
                <StyledInput
                  placeholder="Enter private key"
                  onChange={onChange}
                  value={pk.key}
                  type="password"
                  status={pk.isCorrect === false ? 'error' : ''}
                />
                <FieldHint>Used to derive the signer address for this bulk action.</FieldHint>

                {pk.isCorrect === false && (
                  <Text color="red" size="sm">
                    Invalid private key
                  </Text>
                )}

                {(pk.address || pk.balance) && (
                  <SignerInfoCard>
                    {pk.address && (
                      <SignerInfoRow>
                        <SignerInfoLabel>Address</SignerInfoLabel>
                        <SignerAddressValue title={pk.address}>{pk.address}</SignerAddressValue>
                      </SignerInfoRow>
                    )}
                    {pk.balance && (
                      <SignerInfoRow>
                        <SignerInfoLabel>Balance</SignerInfoLabel>
                        <SignerInfoValue>{pk.balance} WATER</SignerInfoValue>
                      </SignerInfoRow>
                    )}
                  </SignerInfoCard>
                )}

                {pk.hasPendingTransactions && (
                  <WarningText color="red" size="sm">
                    Wait for pending transactions to complete before sending new ones.
                  </WarningText>
                )}
              </SectionCard>
            </AnimatedSection>
          )}
          {(count.success > 0 || count.failed > 0 || status) && (
            <AnimatedSection $delay={3}>
              <ProgressCard>
                <ProgressHeader>
                  <FieldLabel>Execution progress</FieldLabel>
                  <ProgressStats>
                    {count.success} successful, {count.failed} failed,{' '}
                    {ids.length - count.success - count.failed} queued
                  </ProgressStats>
                </ProgressHeader>
                <Tooltip
                  title={`${count.success} successful / ${count.failed} failed / ${ids.length - count.success - count.failed} queued`}
                >
                  <StyledProgress
                    strokeColor={theme.palette.text.blue}
                    type="line"
                    percent={Math.round(((count.success + count.failed) * 100) / ids.length)}
                    success={{ percent: Math.round((count.success * 100) / ids.length) }}
                  />
                </Tooltip>
              </ProgressCard>
            </AnimatedSection>
          )}
        </ModalBody>
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
  width: 100%;
`

const WarningText = styled(Text)`
  margin-top: 2px;
`

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`

const sectionReveal = keyframes`
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const AnimatedSection = styled.div<{ $delay: number }>`
  animation: ${sectionReveal} 180ms ease-out both;
  animation-delay: ${({ $delay }) => `${$delay * 45}ms`};

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const SummaryPanel = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.palette.semantic.card.headerBorder};
  background: ${({ theme }) => theme.palette.semantic.tabs.contentBackground};
`

const SummaryRow = styled.div`
  min-width: 180px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const SummaryLabel = styled(Text)`
  color: ${({ theme }) => theme.palette.text.gray};
`

const ProgressCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.palette.semantic.button.ghostBorder};
  background: ${({ theme }) => theme.palette.semantic.tabs.contentBackground};
`

const ProgressHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`

const ProgressStats = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.palette.text.gray};
`

const StyledProgress = styled(Progress)`
  width: 100%;
  margin: 0;
`

const SectionCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.palette.semantic.card.headerBorder};
  background: ${({ theme }) => theme.palette.semantic.tabs.contentBackground};
`

const FieldLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.palette.text.gray};
`

const FieldHint = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.palette.text.gray};
`

const AddressList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const AddressChip = styled.div`
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.palette.semantic.button.ghostBorder};
  background: ${({ theme }) => theme.palette.semantic.button.ghostHoverBackground};
  font-size: 13px;
  line-height: 1.3;
  word-break: break-all;
`

const SignerInfoCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.palette.semantic.card.headerBorder};
  background: ${({ theme }) => theme.palette.semantic.app.inputBackground};
`

const SignerInfoRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const SignerInfoLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.palette.text.gray};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`

const SignerInfoValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.palette.text.black};
`

const SignerAddressValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.palette.text.black};
  line-height: 1.35;
  word-break: break-all;
`
