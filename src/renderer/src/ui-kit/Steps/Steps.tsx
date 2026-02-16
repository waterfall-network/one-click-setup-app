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
import { Steps, StepsProps } from 'antd'
import React from 'react'
import { keyframes, styled } from 'styled-components'

export type { StepsProps }

export const StepsWithActiveContent: React.FC<StepsProps> = ({ ...props }) => {
  return <StyledSteps {...props} />
}

const stepContentReveal = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const StyledSteps = styled(Steps)`
  .ant-steps-item-content {
    display: none !important;
  }
  .ant-steps-item-active {
    .ant-steps-item-content {
      display: block !important;
      animation: ${stepContentReveal} 190ms ease-out both;
    }
  }

  .ant-steps-item-title {
    font-weight: 500;
    color: ${({ theme }) => theme.palette.text.gray} !important;
  }

  .ant-steps-item-active > .ant-steps-item-container .ant-steps-item-title {
    font-weight: 600;
    color: ${({ theme }) => theme.palette.text.black} !important;
  }

  .ant-steps-item-icon {
    background: ${({ theme }) => theme.palette.semantic.steps.iconBackground} !important;
    border-color: ${({ theme }) => theme.palette.semantic.steps.iconBorder} !important;
  }

  .ant-steps-item-wait .ant-steps-item-icon > .ant-steps-icon,
  .ant-steps-item-finish .ant-steps-item-icon > .ant-steps-icon {
    color: ${({ theme }) => theme.palette.semantic.steps.iconNumber} !important;
    opacity: 1 !important;
  }

  .ant-steps-item-process .ant-steps-item-icon {
    color: ${({ theme }) => theme.palette.semantic.steps.iconNumberActive} !important;
  }

  .ant-steps-item-process .ant-steps-item-icon > .ant-steps-icon {
    color: ${({ theme }) => theme.palette.semantic.steps.iconNumberActive} !important;
    opacity: 1 !important;
  }

  .ant-steps-item-process .ant-steps-item-icon > .ant-steps-icon,
  .ant-steps-item-process .ant-steps-item-icon > .ant-steps-icon * {
    color: ${({ theme }) => theme.palette.semantic.steps.iconNumberActive} !important;
    fill: ${({ theme }) => theme.palette.semantic.steps.iconNumberActive} !important;
    opacity: 1 !important;
  }

  @media (prefers-reduced-motion: reduce) {
    .ant-steps-item-active .ant-steps-item-content {
      animation: none !important;
    }
  }
`
