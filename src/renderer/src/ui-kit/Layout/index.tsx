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
import React from 'react'
import { Layout as AntdLayout } from 'antd'

export { type LayoutProps } from 'antd'

type LayoutType = typeof AntdLayout & {
  Header: typeof AntdLayout.Header
  Footer: typeof AntdLayout.Footer
  Content: typeof AntdLayout.Content
  Sider: typeof AntdLayout.Sider
}

export const Layout = AntdLayout as LayoutType

export const LayoutHeader: React.FC<React.ComponentProps<typeof AntdLayout.Header>> = (props) => (
  <AntdLayout.Header {...props} />
)

export const LayoutFooter: React.FC<React.ComponentProps<typeof AntdLayout.Footer>> = (props) => (
  <AntdLayout.Footer {...props} />
)

export const LayoutContent: React.FC<React.ComponentProps<typeof AntdLayout.Content>> = (props) => (
  <AntdLayout.Content {...props} />
)

export const LayoutSider: React.FC<React.ComponentProps<typeof AntdLayout.Sider>> = (props) => (
  <AntdLayout.Sider {...props} />
)
