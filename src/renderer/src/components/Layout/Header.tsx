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
import { Layout, Flex } from 'antd'
import LogoSrc from '/logo.svg'
import { LayoutHeaderActionT } from '@renderer/types/layout'
import { IconButton } from '@renderer/ui-kit/Button'
import { Text } from '@renderer/ui-kit/Typography'
import { isWindows } from '@renderer/helpers/common'

type HeaderComponentPropsT = {
  title: string
  rightActions?: LayoutHeaderActionT[]
}

export const HeaderComponent: React.FC<HeaderComponentPropsT> = ({ title, rightActions }) => {
  return (
    <AppHeader>
      <DummyNativeActions order={isWindows ? 3 : 1} />
      <Part align={'center'} order={2}>
        <AppLogo />
        <AppTitle>{title}</AppTitle>
      </Part>
      <Part justify={'space-between'} align={'center'} order={isWindows ? 1 : 3}>
        {rightActions?.map((el) => (
          <Button icon={el.icon} key={el.key} onClick={el.onClick} />
        ))}
      </Part>
    </AppHeader>
  )
}

const Button = styled(IconButton)`
  -webkit-app-region: no-drag;
`

const AppHeader = styled(Layout.Header)`
  height: 40px;
  background-color: ${({ theme }) => theme.palette.background.blue};
  -webkit-app-region: drag;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
`

const AppTitle = styled(Text)`
  color: ${({ theme }) => theme.palette.text.white};
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
