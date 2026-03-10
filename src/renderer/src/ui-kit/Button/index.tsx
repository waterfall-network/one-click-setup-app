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
import { Button as AntdButton, ButtonProps } from 'antd'
import { SizeType } from 'antd/es/config-provider/SizeContext'
import {
  StyledArrowButton,
  StyledBaseButton,
  StyledButton,
  StyledIconButton,
  StyledLink,
  StyledTextButton
} from './styles'
import { ArrowRightOutlined, ArrowLeftOutlined } from '@ant-design/icons'

const IconButton: React.FC<
  {
    shape?: 'circle' | 'default' | 'round' | undefined
    size?: SizeType
    icon: React.ReactNode
    onClick?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void
  } & ButtonProps
> = ({ ...props }) => <StyledIconButton type="primary" shape="circle" size="small" {...props} />

const ArrowedButton: React.FC<{
  onClick?: () => void
  direction: 'forward' | 'back'
}> = ({ onClick, direction = 'forward', ...props }) => (
  <StyledArrowButton
    {...props}
    onClick={onClick}
    icon={direction === 'forward' ? <ArrowRightOutlined /> : <ArrowLeftOutlined />}
  />
)

const ButtonPrimary: React.FC<ButtonProps> = ({ children, href, ...props }) => {
  if (href) return <StyledLink to={href}>{children}</StyledLink>

  return (
    <StyledButton type="primary" {...props}>
      {children}
    </StyledButton>
  )
}

const ButtonTextPrimary: React.FC<ButtonProps> = ({ children, ...props }) => (
  <StyledTextButton {...props}>{children}</StyledTextButton>
)

const Button: React.FC<ButtonProps> = ({ children, ...props }) => (
  <StyledBaseButton {...props}>{children}</StyledBaseButton>
)

export { ButtonPrimary, IconButton, ArrowedButton, Button, ButtonTextPrimary, AntdButton }
