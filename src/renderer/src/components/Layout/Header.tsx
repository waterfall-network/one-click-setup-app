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
import styled from 'styled-components'
import { Layout } from '@renderer/ui-kit/Layout'
import { Flex } from '@renderer/ui-kit/Flex'
import LogoSrc from '/logo.svg'
import { LayoutHeaderActionT } from '@renderer/types/layout'
import { IconButton } from '@renderer/ui-kit/Button'
import { Text } from '@renderer/ui-kit/Typography'
import { isMac } from '@renderer/helpers/common'

type HeaderComponentPropsT = {
  title: string
  rightActions?: LayoutHeaderActionT[]
}

export const HeaderComponent: React.FC<HeaderComponentPropsT> = ({ title, rightActions }) => {
  return (
    <AppHeader>
      <DummyNativeActions order={!isMac ? 3 : 1} />
      <Part align={'center'} order={2}>
        <AppLogo />
        <AppTitle>{title}</AppTitle>
      </Part>
      <Part justify={'space-between'} align={'center'} order={!isMac ? 1 : 3}>
        {rightActions?.map((el) => (
          <Button icon={el.icon} key={el.key} onClick={el.onClick} />
        ))}
      </Part>
    </AppHeader>
  )
}

const Button = styled(IconButton)`
  -webkit-app-region: no-drag;
  background: transparent !important;
  border-color: transparent !important;
  box-shadow: none !important;
  .anticon {
    color: ${({ theme }) => theme.palette.text.white} !important;
  }
  &:hover,
  &:focus,
  &:active {
    background: ${({ theme }) => theme.palette.semantic.headerBar.actionHoverBackground} !important;
    border-color: transparent !important;
  }
`

const AppHeader = styled(Layout.Header)`
  height: 40px;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.palette.semantic.headerBar.backgroundStart} 0%,
    ${({ theme }) => theme.palette.semantic.headerBar.backgroundEnd} 100%
  );
  -webkit-app-region: drag;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  border-bottom: 1px solid ${({ theme }) => theme.palette.semantic.headerBar.borderBottom};
  backdrop-filter: blur(6px);
`

const AppTitle = styled(Text).attrs({
  color: 'white'
})`
  padding: 0 8px;
`
const AppLogo = styled.img.attrs({ src: LogoSrc, width: 24, height: 24 })``

const Part = styled(Flex)<{ order: number }>`
  order: ${({ order }) => order || 1};
`

const DummyNativeActions = styled.div<{ order: number }>`
  width: 80px;
  order: ${({ order }) => order || 1};
`
