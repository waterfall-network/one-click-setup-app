/*
 * Copyright 2026   Blue Wave Inc.
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
const { Sider } = Layout

type AppSideBarProps = PropsWithChildren

export const AppSideBar: React.FC<AppSideBarProps> = ({ children }) => {
  return (
    <StyledSider>
      <GlassPanel>{children}</GlassPanel>
    </StyledSider>
  )
}

const StyledSider = styled(Sider)`
  display: flex;
  justify-content: stretch;
  align-items: stretch;
  background: transparent !important;
  min-width: 220px !important;
  max-width: 220px !important;
  padding: 12px 10px;

  .ant-layout-sider-children {
    width: 100%;
    display: flex;
  }
`

const GlassPanel = styled.div`
  width: 100%;
  border-radius: 22px;
  border: 1px solid ${({ theme }) => theme.palette.semantic.sidebar.panelBorder};
  background: ${({ theme }) => theme.palette.semantic.sidebar.panelBackground};
  box-shadow: ${({ theme }) => theme.palette.semantic.sidebar.panelShadow};
  backdrop-filter: blur(18px) saturate(138%);
  -webkit-backdrop-filter: blur(18px) saturate(138%);
  display: flex;
  min-height: 0;
`
