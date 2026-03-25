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
import { ThemeConfig, theme as antdTheme } from 'antd'
import { ThemeMode } from './index'
import { darkPalette, lightPalette } from './palette'

const APP_FONT_FAMILY = "'Avenir Next', 'SF Pro Text', 'Segoe UI', sans-serif"
const BRAND_PRIMARY = '#0097f5'
const BRAND_INFO = '#00c9e8'

export const createAntdTheme = (mode: ThemeMode): ThemeConfig => {
  const isDark = mode === 'dark'
  const palette = isDark ? darkPalette : lightPalette
  const semanticTable = palette.semantic.table
  const semanticLink = palette.semantic.link

  return {
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      fontFamily: APP_FONT_FAMILY,
      colorPrimary: BRAND_PRIMARY,
      colorInfo: BRAND_INFO,
      colorBgBase: isDark ? '#071328' : '#eef4ff',
      colorBgContainer: isDark ? 'rgba(9, 25, 47, 0.76)' : 'rgba(255, 255, 255, 0.78)',
      colorBgElevated: isDark ? '#0f2747' : '#ffffff',
      colorText: isDark ? '#eaf3ff' : '#10233b',
      colorTextSecondary: isDark ? '#b4c6de' : '#617694',
      colorLink: semanticLink.default,
      colorLinkHover: semanticLink.hover,
      colorLinkActive: semanticLink.active,
      colorBorder: isDark ? 'rgba(147, 196, 255, 0.24)' : 'rgba(49, 96, 170, 0.24)',
      borderRadius: 12,
      borderRadiusLG: 16,
      controlHeight: 42,
      boxShadowSecondary: isDark
        ? '0 20px 48px rgba(1, 7, 18, 0.45)'
        : '0 18px 40px rgba(34, 74, 128, 0.16)'
    },
    components: {
      Layout: {
        headerBg: 'transparent',
        bodyBg: 'transparent',
        siderBg: 'transparent',
        footerBg: 'transparent'
      },
      Button: {
        controlHeight: 42,
        borderRadius: 10,
        primaryShadow: 'none',
        defaultShadow: 'none'
      },
      Input: {
        controlHeight: 42,
        activeBorderColor: BRAND_PRIMARY,
        hoverBorderColor: BRAND_INFO,
        activeShadow: isDark
          ? '0 0 0 2px rgba(0, 176, 255, 0.2)'
          : '0 0 0 2px rgba(0, 123, 209, 0.16)'
      },
      InputNumber: {
        controlWidth: 130
      },
      Select: {
        optionSelectedBg: isDark ? 'rgba(10, 40, 76, 0.72)' : 'rgba(229, 241, 255, 0.86)',
        optionActiveBg: isDark ? 'rgba(11, 35, 65, 0.56)' : 'rgba(239, 248, 255, 0.82)',
        multipleItemBg: isDark ? 'rgba(10, 35, 64, 0.6)' : 'rgba(232, 244, 255, 0.78)',
        activeBorderColor: BRAND_PRIMARY,
        hoverBorderColor: BRAND_INFO
      },
      Radio: {
        buttonBg: isDark ? 'rgba(9, 26, 49, 0.62)' : 'rgba(249, 252, 255, 0.92)',
        buttonCheckedBg: isDark ? 'rgba(10, 36, 64, 0.84)' : 'rgba(232, 244, 255, 0.95)',
        buttonColor: isDark ? '#c8def8' : '#2a425f',
        buttonCheckedBgDisabled: isDark ? 'rgba(9, 26, 49, 0.45)' : 'rgba(240, 246, 252, 0.86)',
        buttonSolidCheckedBg: BRAND_PRIMARY,
        buttonSolidCheckedHoverBg: '#15a7ff',
        buttonSolidCheckedActiveBg: '#0089df'
      },
      Switch: {
        colorPrimary: BRAND_PRIMARY,
        colorPrimaryHover: '#15a7ff'
      },
      Checkbox: {
        colorPrimary: BRAND_PRIMARY,
        colorPrimaryHover: '#15a7ff'
      },
      Tabs: {
        inkBarColor: BRAND_PRIMARY,
        itemActiveColor: isDark ? '#8cd9ff' : '#006fbc',
        itemHoverColor: isDark ? '#8cd9ff' : '#006fbc',
        itemSelectedColor: isDark ? '#9be1ff' : '#0a6fb4',
        itemColor: isDark ? '#c8def8' : '#2f4764'
      },
      Card: {
        borderRadiusLG: 16,
        borderRadiusSM: 14,
        headerBg: 'transparent',
        bodyPadding: 20,
        bodyPaddingSM: 16
      },
      Modal: {
        borderRadiusLG: 16,
        contentBg: isDark ? 'rgba(10, 29, 54, 0.9)' : 'rgba(248, 252, 255, 0.93)',
        headerBg: 'transparent',
        titleColor: isDark ? '#eaf3ff' : '#1c3554'
      },
      Table: {
        borderColor: semanticTable.border,
        headerBg: semanticTable.headerBg,
        headerColor: isDark ? '#eaf3ff' : '#163053',
        headerSplitColor: semanticTable.headerSplit,
        rowExpandedBg: semanticTable.rowExpanded,
        footerBg: 'transparent',
        cellPaddingBlock: 15,
        cellPaddingInline: 16,
        rowHoverBg: semanticTable.rowHover
      }
    }
  }
}
