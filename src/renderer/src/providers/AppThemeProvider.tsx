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
import React, { PropsWithChildren } from 'react'
import { ConfigProvider, theme as antdTheme } from 'antd'
import { ThemeProvider, createGlobalStyle } from 'styled-components'
import { createTheme } from '@renderer/ui-kit/theme'
import { useIsDarkTheme } from '@renderer/hooks/theme'

const GlobalThemeStyle = createGlobalStyle`
  body {
    background-color: ${({ theme }) => theme.palette.layout.white};
    color: ${({ theme }) => theme.palette.text.black};
  }
`

type AppThemeProviderProps = PropsWithChildren

export const AppThemeProvider: React.FC<AppThemeProviderProps> = ({ children }) => {
  const isDark = useIsDarkTheme()
  const appTheme = React.useMemo(() => createTheme(isDark ? 'dark' : 'light'), [isDark])

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm
      }}
    >
      <ThemeProvider theme={appTheme}>
        <GlobalThemeStyle />
        {children}
      </ThemeProvider>
    </ConfigProvider>
  )
}
