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
import React, { PropsWithChildren } from 'react'
import { ConfigProvider } from 'antd'
import { ThemeProvider, createGlobalStyle } from 'styled-components'
import { createTheme } from '@renderer/ui-kit/theme'
import { createAntdTheme } from '@renderer/ui-kit/theme/antd'
import { useIsDarkTheme } from '@renderer/hooks/theme'

const GlobalThemeStyle = createGlobalStyle`
  :root {
    --wf-bg-gradient: ${({ theme }) => theme.palette.semantic.app.backgroundGradient};
    --wf-scrollbar-thumb: ${({ theme }) =>
      theme.mode === 'dark' ? 'rgba(162, 207, 255, 0.34)' : 'rgba(54, 112, 187, 0.34)'};
    --wf-scrollbar-track: transparent;
  }

  html {
    height: 100%;
    overflow: hidden;
  }

  * {
    box-sizing: border-box;
    scrollbar-width: thin;
    scrollbar-color: var(--wf-scrollbar-thumb) var(--wf-scrollbar-track);
  }

  *::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  *::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 10px;
  }

  *::-webkit-scrollbar-thumb {
    background: var(--wf-scrollbar-thumb);
    border-radius: 10px;
    border: 2px solid transparent;
    background-clip: content-box;
  }

  *::-webkit-scrollbar-thumb:hover,
  *::-webkit-scrollbar-thumb:active {
    background: var(--wf-scrollbar-thumb);
    border-radius: 10px;
    border: 2px solid transparent;
    background-clip: content-box;
  }

  body {
    margin: 0;
    height: 100%;
    min-height: 100%;
    overflow: hidden;
    font-family: 'Avenir Next', 'SF Pro Text', 'Segoe UI', sans-serif;
    background: var(--wf-bg-gradient);
    background-attachment: fixed;
    color: ${({ theme }) => theme.palette.text.black};
  }

  #root {
    height: 100%;
    min-height: 100%;
    overflow: hidden;
  }

  .ant-layout {
    background: transparent !important;
  }

  .ant-card,
  .ant-modal-content,
  .ant-popover-inner {
    backdrop-filter: blur(6px);
  }

  .ant-input,
  .ant-input-number,
  .ant-select-selector,
  .ant-picker {
    background: ${({ theme }) => theme.palette.semantic.app.inputBackground} !important;
    border-color: ${({ theme }) => theme.palette.semantic.app.inputBorder} !important;
    box-shadow: none !important;
  }

  .ant-select-dropdown,
  .ant-picker-dropdown .ant-picker-panel-container {
    background: ${({ theme }) => theme.palette.semantic.app.dropdownBackground} !important;
    border: 1px solid ${({ theme }) => theme.palette.semantic.app.dropdownBorder} !important;
    backdrop-filter: blur(10px);
  }

  .ant-radio-button-wrapper {
    border-color: ${({ theme }) => theme.palette.semantic.app.radioBorder};
  }

  .ant-switch {
    background: ${({ theme }) => theme.palette.semantic.app.switchBackground};
  }

  .ant-tabs-tab {
    transition: color 0.2s ease;
  }

  .ant-modal-content {
    border: 1px solid ${({ theme }) => theme.palette.semantic.app.modalBorder};
  }
`

type AppThemeProviderProps = PropsWithChildren

export const AppThemeProvider: React.FC<AppThemeProviderProps> = ({ children }) => {
  const isDark = useIsDarkTheme()
  const mode = isDark ? 'dark' : 'light'
  const appTheme = React.useMemo(() => createTheme(mode), [mode])
  const antdThemeConfig = React.useMemo(() => createAntdTheme(mode), [mode])

  return (
    <ConfigProvider theme={antdThemeConfig}>
      <ThemeProvider theme={appTheme}>
        <GlobalThemeStyle />
        {children}
      </ThemeProvider>
    </ConfigProvider>
  )
}
