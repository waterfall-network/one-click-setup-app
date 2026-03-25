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
import { PageContent } from '@renderer/components/Layout/PageContent'
import { AppSideBar } from '@renderer/components/Layout/SideBar'
import { Menu } from '@renderer/components/Menu'
import { root_routes, routes } from '@renderer/constants/navigation'
import { MenuItemT } from '@renderer/types/navigation'
import { PropsWithChildren } from 'react'
import { Text } from '@renderer/ui-kit/Typography'
import {
  DatabaseOutlined,
  DatabaseFilled,
  AppstoreOutlined,
  AppstoreFilled,
  PieChartOutlined,
  PieChartFilled
} from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import { useFetchState } from '@renderer/hooks/app'
import { keyframes, styled } from 'styled-components'

const menuItems: MenuItemT[] = [
  {
    link: routes.nodes.list,
    key: root_routes.nodes,
    icon: <DatabaseOutlined />,
    activeIcon: <DatabaseFilled />,
    title: 'Nodes'
  },
  {
    link: routes.workers.list,
    key: root_routes.workers,
    icon: <AppstoreOutlined />,
    activeIcon: <AppstoreFilled />,
    title: 'Validators'
  },
  {
    link: routes.statistics.view,
    key: root_routes.statistics,
    icon: <PieChartOutlined />,
    activeIcon: <PieChartFilled />,
    title: 'Statistics'
  }
]

export const PageRender: React.FC<PropsWithChildren> = ({ children }) => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { data: appState } = useFetchState()
  const active_root_key = pathname.split('/')?.[1]

  return (
    <>
      <AppSideBar>
        <SidebarContent>
          <Menu menuItems={menuItems} active={active_root_key} />
          <VersionButton type="button" onClick={() => navigate(routes.changelog)}>
            <VersionCaption size="sm">{appState?.version ?? 'Waterfall'}</VersionCaption>
            {appState?.binariesVersion && <VersionCaption size="sm">{appState.binariesVersion}</VersionCaption>}
          </VersionButton>
        </SidebarContent>
      </AppSideBar>
      <PageContent>
        <RouteMotion key={pathname}>{children}</RouteMotion>
      </PageContent>
    </>
  )
}

const SidebarContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 0;
  padding: 8px 6px 12px;
`

const VersionCaption = styled(Text)`
  display: inline-flex;
  align-self: flex-start;
  margin: 10px 8px 0;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  opacity: 0.82;
  background: ${({ theme }) => theme.palette.semantic.sidebar.versionBadgeBackground};
  border: 1px solid ${({ theme }) => theme.palette.semantic.sidebar.versionBadgeBorder};
  transition:
    opacity 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
`

const VersionButton = styled.button`
  appearance: none;
  display: inline-flex;
  align-self: flex-start;
  border: 0;
  background: transparent;
  padding: 0;
  margin: 0;
  border-radius: 999px;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
  outline: none;
  box-shadow: none;

  &:focus,
  &:focus-visible,
  &:active {
    outline: none;
    box-shadow: none;
  }

  &:hover ${VersionCaption} {
    opacity: 1;
  }
`

const routeReveal = keyframes`
  from {
    opacity: 0;
    transform: translateY(3px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const RouteMotion = styled.div`
  min-height: 100%;
  animation: ${routeReveal} 150ms ease-out both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`
