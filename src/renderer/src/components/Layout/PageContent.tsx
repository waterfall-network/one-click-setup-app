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
import { Layout } from '@renderer/ui-kit/Layout'
import { styled } from 'styled-components'
import { HEADER_HEIGHT } from '@renderer/constants/layout'
const { Content } = Layout

type PageContentProps = PropsWithChildren

export const PageContent: React.FC<PageContentProps> = ({ children }) => {
  return <StyledContent>{children}</StyledContent>
}

const StyledContent = styled(Content)`
  .ant-layout {
    background-color: ${({ theme }) => theme.palette.layout.white};
    height: 100%;
    max-height: calc(100vh - ${HEADER_HEIGHT}px);
    overflow: auto;
    box-shadow: ${({ theme }) => theme.palette.semantic.chrome.pageContentInsetShadow};
  }
`
