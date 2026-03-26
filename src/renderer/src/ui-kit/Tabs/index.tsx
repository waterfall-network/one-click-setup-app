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
import { Tabs as AntdTabs, Flex, TabsProps } from 'antd'
import React, { PropsWithChildren } from 'react'
import { keyframes, styled } from 'styled-components'
import { Text } from '../Typography'

export const Tabs: React.FC<TabsProps> = ({ ...props }) => {
  return (
    <TabsWrapper>
      <StyledTabs {...props} />
    </TabsWrapper>
  )
}

type TabContentProps = PropsWithChildren<{
  variant?: 'text' | 'table'
}>

export const TabContent: React.FC<TabContentProps> = ({
  children,
  variant = 'table',
  ...props
}) => {
  return (
    <TabContentWrapper $variant={variant} {...props}>
      {children}
    </TabContentWrapper>
  )
}

export const TabTextRow: React.FC<{ label: string; value?: string | number | React.ReactNode }> = ({
  label,
  value
}) => {
  return (
    <TextItem gap={6} align="center">
      <Text>{label}:</Text>
      <Text>{value}</Text>
    </TextItem>
  )
}
export const TabTextColumn: React.FC<{
  label: string
  value?: string | number | React.ReactNode
}> = ({ label, value }) => {
  return (
    <TextItem gap={4} vertical>
      <Text>{label}</Text>
      <Text>{value}</Text>
    </TextItem>
  )
}

const tabPaneReveal = keyframes`
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

const tabActivePop = keyframes`
  from {
    transform: translateY(1px) scale(0.985);
  }
  to {
    transform: translateY(0) scale(1);
  }
`

const TabsWrapper = styled.div`
  .ant-tabs-nav-add {
    display: none;
  }

  .ant-tabs-nav {
    margin-bottom: 8px !important;
  }

  .ant-tabs-ink-bar {
    transition:
      width 220ms ease,
      transform 220ms ease;
  }

  .ant-tabs-tab {
    border-radius: 10px 10px 0 0;
    padding: 8px 12px !important;
    border: 1px solid transparent;
    transition:
      background 180ms ease,
      border-color 180ms ease,
      transform 180ms ease;
  }

  .ant-tabs-tab .ant-tabs-tab-btn {
    transition: color 180ms ease;
  }

  .ant-tabs-tab:hover {
    transform: translateY(-1px);
  }

  .ant-tabs-tab-active {
    background: ${({ theme }) => theme.palette.semantic.tabs.activeTabBackground};
    border-color: ${({ theme }) => theme.palette.semantic.card.headerBorder};
    border-bottom-color: transparent;
    animation: ${tabActivePop} 180ms ease-out both;
  }

  .ant-tabs-tabpane-active {
    animation: ${tabPaneReveal} 180ms ease-out both;
  }

  @media (prefers-reduced-motion: reduce) {
    .ant-tabs-ink-bar {
      transition: none;
    }

    .ant-tabs-tab {
      transition: none;
    }

    .ant-tabs-tab:hover {
      transform: none;
    }

    .ant-tabs-tab-active {
      animation: none;
    }

    .ant-tabs-tabpane-active {
      animation: none;
    }
  }
`

const StyledTabs = styled(AntdTabs)``

const TabContentWrapper = styled.div<{ $variant: 'text' | 'table' }>`
  padding: 24px ${({ $variant }) => ($variant === 'text' ? '24px' : '0')} 14px;
  border-radius: 12px;
  background: ${({ theme }) => theme.palette.semantic.tabs.contentBackground};

  > * {
    animation: ${sectionReveal} 180ms ease-out both;
  }

  > *:nth-child(1) {
    animation-delay: 0ms;
  }
  > *:nth-child(2) {
    animation-delay: 45ms;
  }
  > *:nth-child(3) {
    animation-delay: 90ms;
  }
  > *:nth-child(4) {
    animation-delay: 135ms;
  }

  @media (prefers-reduced-motion: reduce) {
    > * {
      animation: none;
    }
  }
`

const TextItem = styled(Flex)`
  margin-bottom: 20px;
`
