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
import { FOOTER_HEIGHT } from '@renderer/constants/layout'
import { Layout } from 'antd'
import React from 'react'
import { styled } from 'styled-components'

type PropsT = {
  leftSide?: React.ReactNode
  centerSide?: React.ReactNode
  rightSide?: React.ReactNode
}

export const FooterComponent: React.FC<PropsT> = ({ leftSide, centerSide, rightSide }) => {
  return (
    <StyledFooter>
      <SidePart>{leftSide}</SidePart>
      <Main>
        <Centered>{centerSide}</Centered>
        <Right>{rightSide}</Right>
      </Main>
    </StyledFooter>
  )
}

const StyledFooter = styled(Layout.Footer)`
  height: ${FOOTER_HEIGHT}px;
  background-color: ${({ theme }) => theme.palette.background.lightGray};
  color: ${({ theme }) => theme.palette.text.black};
  border-top: 1px solid
    ${({ theme }) => (theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.12)')};
  padding: 0 10px 0 0;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
`

const SidePart = styled.div`
  background-color: ${({ theme }) => theme.palette.background.gray};
  width: 200px;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 12px;
  box-sizing: border-box;
`

const Main = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  padding: 0 6px 0 10px;
`

const Centered = styled.div``

const Right = styled.div``
