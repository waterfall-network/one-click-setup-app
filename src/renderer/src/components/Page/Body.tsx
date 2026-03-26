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
import React, { PropsWithChildren } from 'react'
import { keyframes, styled } from 'styled-components'
import { Spin } from '@renderer/ui-kit/Spin'
import {
  PAGE_BODY_HEADER_UNDERLAP,
  PAGE_BODY_PADDING_BOTTOM,
  PAGE_BODY_PADDING_SIDE,
  PAGE_BODY_PADDING_TOP
} from '@renderer/constants/layout'

type PageBodyType = PropsWithChildren & {
  isLoading?: boolean
}
export const PageBody: React.FC<PageBodyType> = ({ isLoading, children }) => {
  if (isLoading) {
    return (
      <StyledWrapper>
        <Spin spinning tip="Loading" size="large">
          <LoadingState />
        </Spin>
      </StyledWrapper>
    )
  }

  return (
    <StyledWrapper>
      <Content>{children}</Content>
    </StyledWrapper>
  )
}

const StyledWrapper = styled.div`
  margin-top: -${PAGE_BODY_HEADER_UNDERLAP}px;
  padding: ${PAGE_BODY_PADDING_TOP + PAGE_BODY_HEADER_UNDERLAP}px ${PAGE_BODY_PADDING_SIDE}px
    ${PAGE_BODY_PADDING_BOTTOM}px ${PAGE_BODY_PADDING_SIDE}px;
  box-sizing: border-box;
  flex: 1;
  min-height: 0;
  overflow: auto;
  position: relative;
  z-index: 1;
`

const contentReveal = keyframes`
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const Content = styled.div`
  min-height: 240px;
  animation: ${contentReveal} 180ms ease-out both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const LoadingState = styled.div`
  min-height: 320px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`
