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
import React from 'react'
import { MenuItemT } from '@renderer/types/navigation'
import { Link } from '@renderer/ui-kit/Link'
import { Text } from '@renderer/ui-kit/Typography'
import { css, styled } from 'styled-components'

type MenuPropsT = {
  menuItems: MenuItemT[]
  active?: string
}

export const Menu: React.FC<MenuPropsT> = ({ menuItems, active }) => {
  return (
    <MenuWrapper>
      {menuItems?.map((el) => {
        const isActive = active === el?.key
        const icon = isActive && el.activeIcon ? el.activeIcon : el.icon

        return (
          <MenuItem key={el?.key} $isActive={isActive} to={el.link}>
            <MenuIcon $isActive={isActive}>{icon}</MenuIcon>
            <MenuLabel>
              <Text>{el?.title}</Text>
            </MenuLabel>
          </MenuItem>
        )
      })}
    </MenuWrapper>
  )
}

const MenuWrapper = styled.div`
  margin-top: 18px;
  padding: 0 10px;
`

const activeStyles = css`
  opacity: 1;
  transform: translateX(0);
  background: ${({ theme }) => theme.palette.semantic.menu.activeBackground};
  border-color: ${({ theme }) => theme.palette.semantic.menu.activeBorder};
  box-shadow: ${({ theme }) => theme.palette.semantic.menu.activeShadow};

  &::before {
    opacity: 1;
    transform: scaleY(1);
  }
`

const MenuItem = styled(Link)<{ $isActive?: boolean }>`
  width: 100%;
  height: 46px;
  padding: 0 12px;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 12px;
  border: 1px solid transparent;

  position: relative;
  opacity: 0.86;
  transform: translateX(-1px);
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease,
    transform 0.2s ease;
  ${({ $isActive }) => $isActive && activeStyles}

  &::before {
    content: '';
    position: absolute;
    left: -4px;
    top: 9px;
    bottom: 9px;
    width: 3px;
    border-radius: 99px;
    background: ${({ theme }) => theme.palette.semantic.menu.activeMarker};
    opacity: 0;
    transform: scaleY(0.5);
    transform-origin: center;
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }

  &:hover {
    opacity: 1;
    transform: translateX(0) scale(1.01);
    background: ${({ theme }) => theme.palette.semantic.menu.hoverBackground};
    border-color: ${({ theme }) => theme.palette.semantic.menu.hoverBorder};
    box-shadow: inset 0 0 0 1px ${({ theme }) => theme.palette.semantic.menu.hoverInnerBorder};
  }

  &:active {
    transform: translateX(0) scale(0.995);
  }

  &:focus-visible {
    outline: none;
    opacity: 1;
    border-color: ${({ theme }) => theme.palette.text.blue};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.palette.semantic.menu.focusRing};
  }

  span {
    color: ${({ theme }) => theme.palette.text.black};
    font-weight: ${({ $isActive }) => ($isActive ? 600 : 500)};
    letter-spacing: 0.01em;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    transform: none;

    &:hover,
    &:active {
      transform: none;
    }
  }
`

const MenuLabel = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
`

const MenuIcon = styled.div<{ $isActive?: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid
    ${({ theme, $isActive }) =>
      $isActive ? theme.palette.semantic.menu.iconActiveBorder : 'transparent'};
  background: ${({ theme, $isActive }) =>
    $isActive
      ? theme.palette.semantic.menu.iconActiveBackground
      : theme.palette.semantic.menu.iconDefaultBackground};
  box-shadow: ${({ theme, $isActive }) =>
    $isActive ? theme.palette.semantic.menu.iconActiveShadow : 'none'};
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;

  .anticon {
    font-size: 16px;
    color: ${({ theme, $isActive }) =>
      $isActive
        ? theme.palette.semantic.menu.iconActiveColor
        : theme.palette.text.black} !important;
    transition:
      color 0.2s ease,
      transform 0.2s ease;
    transform: ${({ $isActive }) => ($isActive ? 'scale(1.05)' : 'scale(1)')};
  }

  ${MenuItem}:hover & {
    transform: scale(1.05);
  }

  ${MenuItem}:active & {
    transform: scale(1.02);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    transform: none;

    ${MenuItem}:hover &,
    ${MenuItem}:active & {
      transform: none;
    }
  }
`
