/*
 * Copyright 2026   Digital Clever Solution Inc.
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
import React, { PropsWithChildren } from 'react'
import { styled } from 'styled-components'
import { ButtonPrimary } from '@renderer/ui-kit/Button'
import { Alert } from '@renderer/ui-kit/Alert'
import { Card } from '@renderer/ui-kit/Card'
import { Text } from '@renderer/ui-kit/Typography'

type FormPropsT = PropsWithChildren & {
  title?: string
  goNext?: () => void
  goPrev?: () => void
  canGoNext?: boolean
  extra?: React.ReactNode
  nextText?: string
  isLoading?: boolean
  error?: string
  showActionsDivider?: boolean
}

export const AddWorkerForm: React.FC<FormPropsT> = ({
  children,
  canGoNext = true,
  goNext,
  goPrev,
  title,
  extra,
  nextText = 'Next',
  isLoading,
  error
}) => {
  const resolvedTitle = typeof title === 'string' ? <CardTitle>{title}</CardTitle> : title

  return (
    <StyledCard title={resolvedTitle} extra={extra}>
      <Body>{children}</Body>
      {error && <Alert type="error" title={error} />}
      <Actions>
        <ButtonPrimary onClick={goPrev} ghost disabled={!goPrev}>
          Back
        </ButtonPrimary>
        <ButtonPrimary
          onClick={goNext}
          disabled={!canGoNext}
          loading={isLoading ? isLoading : false}
        >
          {nextText}
        </ButtonPrimary>
      </Actions>
    </StyledCard>
  )
}

const StyledCard = styled(Card)`
  margin-top: 26px;
`

const Body = styled.div`
  padding-top: 4px;
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 26px;
  gap: 15px;
`

const CardTitle = styled(Text)`
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.01em;
`
