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
import React, { PropsWithChildren } from 'react'
import { styled } from 'styled-components'
import { ButtonPrimary } from '@renderer/ui-kit/Button'
import { Card } from '@renderer/ui-kit/Card'
import { Text } from '@renderer/ui-kit/Typography'

type FormPropsT = PropsWithChildren & {
  title: string
  goNext?: () => void
  goPrev?: () => void
  canGoNext?: boolean
  goNextTitle?: string
  goPrevTitle?: string
  isLoading?: boolean
  showActionsDivider?: boolean
}

export const NodeAddForm: React.FC<FormPropsT> = ({
  children,
  title,
  canGoNext = true,
  goNext,
  goPrev,
  goNextTitle = 'Next',
  goPrevTitle = 'Back',
  isLoading
}) => {
  return (
    <StyledCard title={<CardTitle>{title}</CardTitle>}>
      <Body>{children}</Body>
      <Actions>
        <ButtonPrimary onClick={goPrev} ghost disabled={!goPrev}>
          {goPrevTitle}
        </ButtonPrimary>
        <ButtonPrimary
          onClick={goNext}
          disabled={!canGoNext}
          loading={isLoading ? isLoading : false}
        >
          {goNextTitle}
        </ButtonPrimary>
      </Actions>
    </StyledCard>
  )
}

const StyledCard = styled(Card)`
  margin-top: 26px;
`

const CardTitle = styled(Text)`
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.01em;
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
