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
import { Alert as AntdAlert, type AlertProps } from 'antd'
import React from 'react'
import { keyframes, styled } from 'styled-components'

export { type AlertProps }

export const Alert: React.FC<AlertProps> = (props) => <StyledAlert {...props} />

const alertReveal = keyframes`
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const StyledAlert = styled(AntdAlert)`
  animation: ${alertReveal} 170ms ease-out both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`
