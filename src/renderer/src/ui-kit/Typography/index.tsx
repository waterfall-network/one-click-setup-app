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
import { Typography } from 'antd'
import React, { PropsWithChildren } from 'react'
import styled from 'styled-components'
const { Title, Text: AntdText } = Typography

type TextPropsT = PropsWithChildren & {
  color?: 'black' | 'white' | 'red'
  size?: 'xsm' | 'sm' | 'md' | 'lg'
}

const Text: React.FC<TextPropsT> = ({ color = 'black', size = 'md', children, ...props }) => {
  return (
    <StyledText color={color} size={size} {...props}>
      {children}
    </StyledText>
  )
}

const sizes = {
  xsm: '10px',
  sm: '14px',
  md: '16px',
  lg: '18px'
}

const StyledText = styled(AntdText)<TextPropsT>`
  color: ${({ theme, color }) => {
    switch (color) {
      case 'white':
        return theme.palette.text.white
      case 'red':
        return theme.palette.text.red
      case 'black':
      default:
        return theme.palette.text.black
    }
  }};
  font-size: ${({ size }) => sizes[size || 'md']};
`

export { Title, Text }
