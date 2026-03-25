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
import { styled } from 'styled-components'
import { Button } from 'antd'
import { Link } from 'react-router-dom'

export const StyledBaseButton = styled(Button)`
  transition:
    transform 0.14s ease,
    filter 0.14s ease;

  &:hover:not(:disabled),
  &:focus-visible:not(:disabled) {
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0) scale(0.985);
    filter: none;
  }

  &.ant-btn-disabled,
  &.ant-btn-disabled:hover {
    transform: none;
    filter: none;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    transform: none !important;
    filter: none !important;
  }
`

export const StyledArrowButton = styled(StyledBaseButton)`
  width: 25px;
  height: 24px;
  border: none;
  background-color: transparent;
  box-shadow: none;
  border-radius: 8px;
  transition:
    transform 0.14s ease,
    background 0.14s ease,
    color 0.14s ease;

  &:hover:not(:disabled),
  &:focus-visible:not(:disabled) {
    transform: translateY(-1px) scale(1.02);
    background: ${({ theme }) => theme.palette.semantic.button.ghostHoverBackground};
  }

  &:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    transform: none !important;
  }
`

export const StyledButton = styled(StyledBaseButton)`
  height: 40px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: ${({ theme }) => theme.palette.semantic.button.primaryBackground} !important;
  color: ${({ theme }) => theme.palette.semantic.button.primaryText} !important;
  box-shadow: ${({ theme }) => theme.palette.semantic.button.primaryShadow};
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    filter 0.18s ease;

  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.01em;

  &:hover,
  &:focus {
    transform: translateY(-2px) scale(1.02);
    box-shadow: ${({ theme }) => theme.palette.semantic.button.primaryHoverShadow};
    filter: ${({ theme }) => theme.palette.semantic.button.primaryHoverFilter};
  }

  &:active {
    transform: translateY(0) scale(0.985);
    box-shadow: ${({ theme }) => theme.palette.semantic.button.primaryActiveShadow};
  }

  &.ant-btn-background-ghost {
    background: transparent !important;
    color: ${({ theme }) => theme.palette.semantic.button.ghostText} !important;
    border-color: ${({ theme }) => theme.palette.semantic.button.ghostBorder} !important;
    box-shadow: none;
    &:hover,
    &:focus {
      transform: translateY(0) scale(1.01);
      background: ${({ theme }) => theme.palette.semantic.button.ghostHoverBackground} !important;
      filter: none;
      box-shadow: none;
    }

    &:active {
      transform: translateY(0) scale(0.985);
    }
  }

  &.ant-btn-dangerous {
    background: ${({ theme }) => theme.palette.semantic.button.dangerBackground} !important;
    color: ${({ theme }) => theme.palette.semantic.button.dangerText} !important;
    box-shadow: ${({ theme }) => theme.palette.semantic.button.dangerShadow};
  }

  &.ant-btn-loading,
  &.ant-btn-loading:hover {
    transform: none;
  }

  &.ant-btn-disabled,
  &.ant-btn-disabled:hover {
    background: ${({ theme }) => theme.palette.semantic.button.disabledBackground} !important;
    border-color: ${({ theme }) => theme.palette.semantic.button.disabledBorder} !important;
    color: ${({ theme }) => theme.palette.semantic.button.disabledText} !important;
    transform: none;
    box-shadow: none;
    filter: ${({ theme }) => theme.palette.semantic.button.disabledFilter};
  }

  &.ant-btn-background-ghost.ant-btn-disabled,
  &.ant-btn-background-ghost.ant-btn-disabled:hover {
    background: ${({ theme }) => theme.palette.semantic.button.ghostDisabledBackground} !important;
    border-color: ${({ theme }) => theme.palette.semantic.button.ghostDisabledBorder} !important;
    color: ${({ theme }) => theme.palette.semantic.button.ghostDisabledText} !important;
    filter: none;
  }

  > a {
    color: inherit;
  }

  .anticon {
    font-size: 16px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    transform: none !important;
    filter: none !important;
  }
`

export const StyledLink = styled(Link)`
  height: 40px;
  padding: 0 16px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.01em;

  border: 1px solid transparent !important;
  background: ${({ theme }) => theme.palette.semantic.button.primaryBackground};
  border-radius: 10px;
  box-shadow: ${({ theme }) => theme.palette.semantic.button.primaryShadow};
  color: ${({ theme }) => theme.palette.semantic.button.primaryText};
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    filter 0.18s ease;

  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: ${({ theme }) => theme.palette.semantic.button.primaryHoverShadow};
    filter: ${({ theme }) => theme.palette.semantic.button.primaryHoverFilter};
    color: ${({ theme }) => theme.palette.semantic.button.primaryText};
  }

  &:active {
    transform: translateY(0) scale(0.985);
    box-shadow: ${({ theme }) => theme.palette.semantic.button.primaryActiveShadow};
  }

  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 2px ${({ theme }) => theme.palette.semantic.button.linkFocusRing},
      ${({ theme }) => theme.palette.semantic.button.primaryHoverShadow};
  }

  .anticon {
    font-size: 16px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    transform: none !important;
    filter: none !important;
  }
`

export const StyledTextButton = styled(Button)`
  height: 40px;
  display: flex;
  align-items: center;

  font-size: 14px;
  color: ${({ theme }) => theme.palette.text.blue};
  transition:
    transform 0.14s ease,
    background 0.14s ease,
    filter 0.14s ease;

  &:hover:not(:disabled),
  &:focus-visible:not(:disabled) {
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &.ant-btn-background-ghost {
    background: transparent !important;
    color: ${({ theme }) => theme.palette.semantic.button.ghostText} !important;
    border-color: ${({ theme }) => theme.palette.semantic.button.ghostBorder} !important;
    box-shadow: none;
    &:hover,
    &:focus {
      background: ${({ theme }) => theme.palette.semantic.button.ghostHoverBackground} !important;
      filter: none;
      box-shadow: none;
    }
  }

  &.ant-btn-background-ghost.ant-btn-disabled,
  &.ant-btn-background-ghost.ant-btn-disabled:hover {
    background: ${({ theme }) => theme.palette.semantic.button.ghostDisabledBackground} !important;
    border-color: ${({ theme }) => theme.palette.semantic.button.ghostDisabledBorder} !important;
    color: ${({ theme }) => theme.palette.semantic.button.ghostDisabledText} !important;
    filter: none;
    box-shadow: none;
  }

  .anticon {
    font-size: 16px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    transform: none !important;
    filter: none !important;
  }
`

export const StyledIconButton = styled(StyledBaseButton)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    transform 0.14s ease,
    filter 0.14s ease;

  &:hover:not(:disabled),
  &:focus-visible:not(:disabled) {
    transform: translateY(-1px) scale(1.02);
    filter: ${({ theme }) => theme.palette.semantic.button.primaryHoverFilter};
  }

  &:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
    filter: none;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    transform: none !important;
    filter: none !important;
  }
`
