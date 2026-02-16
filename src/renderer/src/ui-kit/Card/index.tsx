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
import React from 'react'
import { Card as AntdCard, CardProps } from 'antd'
import { styled } from 'styled-components'

export { type CardProps }

export const Card: React.FC<CardProps> = ({ children, ...props }) => {
  return <StyledCard {...props}>{children}</StyledCard>
}

const StyledCard = styled(AntdCard)`
  border: 1px solid ${({ theme }) => theme.palette.semantic.card.border};
  border-radius: 16px;
  background: ${({ theme }) => theme.palette.semantic.card.background};
  box-shadow: ${({ theme }) => theme.palette.semantic.card.shadow};
  backdrop-filter: blur(7px);

  .ant-card-head {
    border-bottom-color: ${({ theme }) => theme.palette.semantic.card.headerBorder};
  }

  .ant-card-head-title {
    color: ${({ theme }) => theme.palette.text.black};
    font-weight: 600;
  }

  .ant-card-body {
    color: ${({ theme }) => theme.palette.text.black};
  }
`
