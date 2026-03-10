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
import { HeaderComponent } from '@renderer/components/Layout/Header'
import {
  SettingOutlined,
  ReadOutlined,
  HomeOutlined,
  BellOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import { useNavigation } from '../../hooks/navigation'
import { routes } from '../../constants/navigation'
import React from 'react'
import { APP_TITLE } from '../../constants/env'

type RightActionsType = {
  key: string
  to: string
  icon: React.ReactNode
}
const RightActions: RightActionsType[] = [
  { key: 'home', to: 'https://waterfall.network', icon: <HomeOutlined /> },
  { key: 'docs', to: 'https://docs.waterfall.network', icon: <ReadOutlined /> },
  { key: 'settings', to: routes.settings, icon: <SettingOutlined /> },
  { key: 'changelog', to: routes.changelog, icon: <ClockCircleOutlined /> },
  { key: 'notification', to: routes.notifications, icon: <BellOutlined /> }
]

export const Header = () => {
  const { goRoute, goBrowser } = useNavigation()
  const rightActions = RightActions.map((el) => ({
    ...el,
    onClick: () => {
      if (el.to.search('http') > -1) {
        return goBrowser(el.to)
      }
      return goRoute(el.to)
    }
  }))

  return <HeaderComponent title={APP_TITLE} rightActions={rightActions} />
}
