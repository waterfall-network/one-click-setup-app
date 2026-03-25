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
import { blue } from '@ant-design/colors'

const grayScale = {
  _0: '#ffffff',
  _1: '#fafafa',
  _2: '#f5f5f5',
  _3: '#f0f0f0',
  _4: '#e9e9ec',
  _5: '#bfbfbf',
  _6: '#8c8c8c',
  _7: '#595959',
  _8: '#434343',
  _9: '#262626',
  _10: '#1f1f1f',
  _11: '#141414',
  _12: '#000000'
}

export interface ThemePalette {
  layout: {
    white: string
    light: string
    black: string
  }
  background: {
    white: string
    lightGray: string
    gray: string
    darkGray: string
    blue: string
    black: string
  }
  text: {
    white: string
    lightGray: string
    gray: string
    blue: string
    black: string
    red: string
  }
  common: {
    white: string
    gray: string
    black: string
  }
  semantic: {
    app: {
      backgroundGradient: string
      inputBackground: string
      inputBorder: string
      dropdownBackground: string
      dropdownBorder: string
      radioBorder: string
      switchBackground: string
      modalBorder: string
    }
    chrome: {
      pageContentInsetShadow: string
      footerTopBorder: string
      footerSideBorder: string
    }
    headerBar: {
      actionHoverBackground: string
      backgroundStart: string
      backgroundEnd: string
      borderBottom: string
    }
    pageHeader: {
      title: string
      crumb: string
      crumbSeparator: string
      shellBorder: string
      shellBackground: string
      shellShadow: string
      shellHighlight: string
      shellSheen: string
      shellGlow: string
    }
    card: {
      border: string
      background: string
      shadow: string
      headerBorder: string
    }
    form: {
      actionsBorder: string
    }
    tabs: {
      activeTabBackground: string
      contentBackground: string
    }
    steps: {
      iconBackground: string
      iconBorder: string
      iconNumber: string
      iconNumberActive: string
    }
    button: {
      primaryBackground: string
      primaryText: string
      primaryShadow: string
      primaryHoverShadow: string
      primaryActiveShadow: string
      primaryHoverFilter: string
      dangerBackground: string
      dangerText: string
      dangerShadow: string
      disabledBackground: string
      disabledBorder: string
      disabledText: string
      disabledFilter: string
      ghostText: string
      ghostBorder: string
      ghostHoverBackground: string
      ghostDisabledBackground: string
      ghostDisabledBorder: string
      ghostDisabledText: string
      linkFocusRing: string
    }
    mnemonic: {
      inputBorder: string
      dividerBorder: string
      chipBackground: string
      chipBorder: string
      chipText: string
      chipHoverBackground: string
      chipHoverBorder: string
      chipDisabledBackground: string
      chipDisabledText: string
    }
    nodeAdd: {
      previewBorder: string
      previewBackground: string
      choiceBorder: string
      choiceBackground: string
      portBorder: string
      portBackground: string
    }
    sidebar: {
      panelBorder: string
      panelBackground: string
      panelShadow: string
      versionBadgeBackground: string
      versionBadgeBorder: string
    }
    menu: {
      activeBackground: string
      activeBorder: string
      activeShadow: string
      activeMarker: string
      hoverBackground: string
      hoverBorder: string
      hoverInnerBorder: string
      focusRing: string
      iconActiveBorder: string
      iconActiveBackground: string
      iconDefaultBackground: string
      iconActiveColor: string
      iconActiveShadow: string
    }
    link: {
      default: string
      hover: string
      active: string
      focusRing: string
    }
    table: {
      border: string
      headerBg: string
      headerSplit: string
      rowHover: string
      rowExpanded: string
      rowBorder: string
    }
    changelog: {
      new: string
      improve: string
      update: string
      fix: string
    }
  }
}

export const lightPalette: ThemePalette = {
  layout: {
    white: '#f4f8ff',
    light: '#eef4ff',
    black: '#11253f'
  },
  background: {
    white: 'rgba(255, 255, 255, 0.78)',
    lightGray: 'rgba(246, 251, 255, 0.74)',
    gray: 'rgba(232, 241, 255, 0.72)',
    darkGray: '#7f98ba',
    blue: blue.primary ?? '#0097f5',
    black: '#0f2340'
  },
  text: {
    white: grayScale._0,
    lightGray: '#f0f6ff',
    gray: '#6a809e',
    blue: blue.primary ?? '#0097f5',
    black: '#10233b',
    red: '#f5222d'
  },
  common: {
    white: grayScale._0,
    gray: '#edf4ff',
    black: grayScale._12
  },
  semantic: {
    app: {
      backgroundGradient:
        'radial-gradient(120% 100% at 100% 0%, rgba(81, 145, 238, 0.22) 0%, transparent 52%), radial-gradient(110% 95% at 0% 100%, rgba(0, 203, 177, 0.16) 0%, transparent 56%), linear-gradient(145deg, #f8fbff, #e8f1ff)',
      inputBackground: 'rgba(255, 255, 255, 0.72)',
      inputBorder: 'rgba(59, 112, 186, 0.18)',
      dropdownBackground: 'rgba(248, 252, 255, 0.96)',
      dropdownBorder: 'rgba(59, 112, 186, 0.14)',
      radioBorder: 'rgba(59, 112, 186, 0.16)',
      switchBackground: 'rgba(166, 188, 213, 0.7)',
      modalBorder: 'rgba(59, 112, 186, 0.16)'
    },
    chrome: {
      pageContentInsetShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.52)',
      footerTopBorder: 'rgba(0, 0, 0, 0.12)',
      footerSideBorder: 'rgba(33, 81, 145, 0.1)'
    },
    headerBar: {
      actionHoverBackground: 'rgba(255, 255, 255, 0.2)',
      backgroundStart: 'rgba(0, 142, 238, 0.66)',
      backgroundEnd: 'rgba(0, 197, 184, 0.52)',
      borderBottom: 'rgba(20, 66, 125, 0.2)'
    },
    pageHeader: {
      title: '#173a61',
      crumb: '#5a7596',
      crumbSeparator: '#82a0c2',
      shellBorder: 'rgba(58, 110, 183, 0.16)',
      shellBackground:
        'linear-gradient(155deg, rgba(255, 255, 255, 0.82) 0%, rgba(243, 250, 255, 0.68) 100%)',
      shellShadow: '0 10px 24px rgba(45, 92, 157, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.62)',
      shellHighlight: 'rgba(255, 255, 255, 0.18)',
      shellSheen:
        'linear-gradient(120deg, rgba(255, 255, 255, 0.34) 0%, rgba(255, 255, 255, 0.08) 32%, rgba(255, 255, 255, 0) 58%)',
      shellGlow:
        'radial-gradient(120% 160% at 10% -30%, rgba(134, 190, 255, 0.28) 0%, rgba(134, 190, 255, 0) 58%)'
    },
    card: {
      border: 'rgba(55, 108, 183, 0.16)',
      background:
        'linear-gradient(160deg, rgba(255, 255, 255, 0.9) 0%, rgba(244, 250, 255, 0.82) 100%)',
      shadow: '0 10px 24px rgba(38, 86, 154, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.65)',
      headerBorder: 'rgba(55, 108, 183, 0.12)'
    },
    form: {
      actionsBorder: 'rgba(59, 112, 186, 0.12)'
    },
    tabs: {
      activeTabBackground: 'rgba(236, 246, 255, 0.86)',
      contentBackground: 'rgba(242, 249, 255, 0.46)'
    },
    steps: {
      iconBackground: 'rgba(243, 250, 255, 0.86)',
      iconBorder: 'rgba(56, 110, 184, 0.16)',
      iconNumber: '#5f7a9a',
      iconNumberActive: '#1b3f66'
    },
    button: {
      primaryBackground: 'linear-gradient(135deg, #0097f5 0%, #04d8c5 100%)',
      primaryText: '#ffffff',
      primaryShadow: '0 8px 18px rgba(0, 112, 198, 0.26)',
      primaryHoverShadow: '0 12px 24px rgba(0, 112, 198, 0.32)',
      primaryActiveShadow: '0 5px 12px rgba(0, 112, 198, 0.24)',
      primaryHoverFilter: 'brightness(1.03)',
      dangerBackground: 'linear-gradient(135deg, #f15465 0%, #ff8a6a 100%)',
      dangerText: '#ffffff',
      dangerShadow: '0 8px 18px rgba(195, 54, 71, 0.28)',
      disabledBackground: 'rgba(151, 177, 207, 0.48)',
      disabledBorder: 'rgba(84, 130, 186, 0.24)',
      disabledText: 'rgba(255, 255, 255, 0.82)',
      disabledFilter: 'saturate(0.82)',
      ghostText: '#35506f',
      ghostBorder: 'rgba(0, 123, 209, 0.32)',
      ghostHoverBackground: 'rgba(223, 241, 255, 0.84)',
      ghostDisabledBackground: 'rgba(153, 170, 191, 0.12)',
      ghostDisabledBorder: 'rgba(92, 138, 193, 0.24)',
      ghostDisabledText: '#8b9db5',
      linkFocusRing: 'rgba(0, 123, 209, 0.3)'
    },
    mnemonic: {
      inputBorder: 'rgba(0, 0, 0, 0.2)',
      dividerBorder: 'rgba(0, 0, 0, 0.2)',
      chipBackground: 'rgba(255, 255, 255, 0.66)',
      chipBorder: 'rgba(59, 112, 186, 0.16)',
      chipText: '#425e7f',
      chipHoverBackground: 'rgba(237, 246, 255, 0.92)',
      chipHoverBorder: 'rgba(45, 120, 206, 0.28)',
      chipDisabledBackground: 'rgba(153, 170, 191, 0.12)',
      chipDisabledText: '#8b9db5'
    },
    nodeAdd: {
      previewBorder: 'rgba(59, 112, 186, 0.14)',
      previewBackground: 'rgba(245, 251, 255, 0.54)',
      choiceBorder: 'rgba(59, 112, 186, 0.12)',
      choiceBackground: 'rgba(249, 253, 255, 0.78)',
      portBorder: 'rgba(59, 112, 186, 0.1)',
      portBackground: 'rgba(248, 252, 255, 0.66)'
    },
    sidebar: {
      panelBorder: 'rgba(59, 112, 186, 0.2)',
      panelBackground:
        'linear-gradient(155deg, rgba(255, 255, 255, 0.74) 0%, rgba(241, 248, 255, 0.64) 100%)',
      panelShadow: '0 18px 34px rgba(40, 86, 151, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.68)',
      versionBadgeBackground: 'rgba(255, 255, 255, 0.52)',
      versionBadgeBorder: 'rgba(59, 112, 186, 0.16)'
    },
    menu: {
      activeBackground:
        'linear-gradient(135deg, rgba(0, 151, 245, 0.18) 0%, rgba(0, 210, 189, 0.13) 100%)',
      activeBorder: 'rgba(40, 111, 191, 0.24)',
      activeShadow: '0 10px 20px rgba(55, 103, 168, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.42)',
      activeMarker: 'linear-gradient(180deg, #00b4ff 0%, #04d8c5 100%)',
      hoverBackground: 'rgba(237, 246, 255, 0.82)',
      hoverBorder: 'rgba(48, 109, 182, 0.22)',
      hoverInnerBorder: 'rgba(48, 109, 182, 0.14)',
      focusRing: 'rgba(17, 122, 219, 0.2)',
      iconActiveBorder: 'rgba(45, 120, 206, 0.25)',
      iconActiveBackground:
        'linear-gradient(140deg, rgba(255, 255, 255, 0.9) 0%, rgba(237, 246, 255, 0.84) 100%)',
      iconDefaultBackground: 'rgba(255, 255, 255, 0.42)',
      iconActiveColor: '#007bd1',
      iconActiveShadow: '0 6px 14px rgba(52, 104, 173, 0.18)'
    },
    link: {
      default: '#2f72d6',
      hover: '#1f6be0',
      active: '#165ec8',
      focusRing: 'rgba(31, 107, 224, 0.28)'
    },
    table: {
      border: 'rgba(59, 112, 186, 0.18)',
      headerBg: 'rgba(237, 246, 255, 0.9)',
      headerSplit: 'rgba(48, 109, 182, 0.22)',
      rowHover: 'rgba(237, 246, 255, 0.82)',
      rowExpanded: 'rgba(237, 246, 255, 0.76)',
      rowBorder: 'rgba(48, 109, 182, 0.12)'
    },
    changelog: {
      new: '#2a6fb7',
      improve: '#2b8b7c',
      update: '#506b92',
      fix: '#9a6562'
    }
  }
}

export const darkPalette: ThemePalette = {
  layout: {
    white: '#08182f',
    light: '#10233d',
    black: '#edf6ff'
  },
  background: {
    white: 'rgba(9, 24, 46, 0.78)',
    lightGray: 'rgba(15, 36, 61, 0.74)',
    gray: 'rgba(17, 42, 71, 0.72)',
    darkGray: '#6f8bb1',
    blue: blue.primary ?? '#0097f5',
    black: '#eff7ff'
  },
  text: {
    white: grayScale._0,
    lightGray: '#f1f8ff',
    gray: '#b3c7e0',
    blue: blue.primary ?? '#00b4ff',
    black: '#ecf5ff',
    red: '#ff7875'
  },
  common: {
    white: grayScale._0,
    gray: '#8ea8c8',
    black: grayScale._12
  },
  semantic: {
    app: {
      backgroundGradient:
        'radial-gradient(120% 100% at 100% 0%, rgba(86, 168, 255, 0.25) 0%, transparent 52%), radial-gradient(110% 95% at 0% 100%, rgba(5, 213, 163, 0.18) 0%, transparent 56%), linear-gradient(145deg, #071328, #12375f)',
      inputBackground: 'rgba(9, 29, 53, 0.64)',
      inputBorder: 'rgba(150, 205, 255, 0.22)',
      dropdownBackground: 'rgba(9, 26, 49, 0.94)',
      dropdownBorder: 'rgba(154, 208, 255, 0.2)',
      radioBorder: 'rgba(150, 205, 255, 0.22)',
      switchBackground: 'rgba(17, 49, 84, 0.72)',
      modalBorder: 'rgba(162, 207, 255, 0.2)'
    },
    chrome: {
      pageContentInsetShadow: 'inset 0 1px 0 rgba(184, 225, 255, 0.08)',
      footerTopBorder: 'rgba(255, 255, 255, 0.16)',
      footerSideBorder: 'rgba(167, 211, 255, 0.12)'
    },
    headerBar: {
      actionHoverBackground: 'rgba(255, 255, 255, 0.12)',
      backgroundStart: 'rgba(0, 142, 238, 0.52)',
      backgroundEnd: 'rgba(4, 216, 197, 0.4)',
      borderBottom: 'rgba(183, 225, 255, 0.2)'
    },
    pageHeader: {
      title: '#ecf5ff',
      crumb: '#9eb8d6',
      crumbSeparator: '#6f8fb4',
      shellBorder: 'rgba(158, 206, 255, 0.2)',
      shellBackground:
        'linear-gradient(155deg, rgba(11, 31, 57, 0.76) 0%, rgba(8, 24, 46, 0.62) 100%)',
      shellShadow: '0 12px 28px rgba(2, 9, 22, 0.34), inset 0 1px 0 rgba(190, 232, 255, 0.1)',
      shellHighlight: 'rgba(190, 232, 255, 0.14)',
      shellSheen:
        'linear-gradient(120deg, rgba(204, 235, 255, 0.18) 0%, rgba(157, 214, 255, 0.08) 34%, rgba(157, 214, 255, 0) 62%)',
      shellGlow:
        'radial-gradient(120% 160% at 12% -34%, rgba(114, 196, 255, 0.24) 0%, rgba(114, 196, 255, 0) 58%)'
    },
    card: {
      border: 'rgba(162, 207, 255, 0.22)',
      background: 'linear-gradient(160deg, rgba(11, 30, 55, 0.82) 0%, rgba(11, 30, 55, 0.7) 100%)',
      shadow: '0 16px 32px rgba(2, 8, 21, 0.3), inset 0 1px 0 rgba(188, 229, 255, 0.12)',
      headerBorder: 'rgba(164, 208, 255, 0.18)'
    },
    form: {
      actionsBorder: 'rgba(162, 207, 255, 0.16)'
    },
    tabs: {
      activeTabBackground: 'rgba(10, 36, 66, 0.72)',
      contentBackground: 'rgba(8, 27, 49, 0.32)'
    },
    steps: {
      iconBackground: 'rgba(9, 31, 58, 0.72)',
      iconBorder: 'rgba(156, 208, 255, 0.24)',
      iconNumber: '#a4bdd9',
      iconNumberActive: '#e9f4ff'
    },
    button: {
      primaryBackground: 'linear-gradient(135deg, #0097f5 0%, #04d8c5 100%)',
      primaryText: '#ffffff',
      primaryShadow: '0 8px 18px rgba(0, 112, 198, 0.26)',
      primaryHoverShadow: '0 12px 24px rgba(0, 112, 198, 0.32)',
      primaryActiveShadow: '0 5px 12px rgba(0, 112, 198, 0.24)',
      primaryHoverFilter: 'brightness(1.03)',
      dangerBackground: 'linear-gradient(135deg, #f15465 0%, #ff8a6a 100%)',
      dangerText: '#ffffff',
      dangerShadow: '0 8px 18px rgba(195, 54, 71, 0.28)',
      disabledBackground: 'rgba(43, 74, 109, 0.52)',
      disabledBorder: 'rgba(124, 181, 236, 0.24)',
      disabledText: 'rgba(226, 241, 255, 0.72)',
      disabledFilter: 'saturate(0.82)',
      ghostText: '#b9cde5',
      ghostBorder: 'rgba(114, 206, 255, 0.45)',
      ghostHoverBackground: 'rgba(18, 60, 96, 0.45)',
      ghostDisabledBackground: 'rgba(255, 255, 255, 0.08)',
      ghostDisabledBorder: 'rgba(131, 198, 255, 0.2)',
      ghostDisabledText: '#7e97b5',
      linkFocusRing: 'rgba(114, 206, 255, 0.42)'
    },
    mnemonic: {
      inputBorder: 'rgba(255, 255, 255, 0.22)',
      dividerBorder: 'rgba(255, 255, 255, 0.22)',
      chipBackground: 'rgba(11, 36, 66, 0.58)',
      chipBorder: 'rgba(150, 205, 255, 0.24)',
      chipText: '#c8ddf4',
      chipHoverBackground: 'rgba(15, 46, 82, 0.78)',
      chipHoverBorder: 'rgba(146, 216, 255, 0.42)',
      chipDisabledBackground: 'rgba(255, 255, 255, 0.08)',
      chipDisabledText: '#7e97b5'
    },
    nodeAdd: {
      previewBorder: 'rgba(162, 207, 255, 0.18)',
      previewBackground: 'rgba(8, 28, 53, 0.34)',
      choiceBorder: 'rgba(162, 207, 255, 0.16)',
      choiceBackground: 'rgba(8, 26, 49, 0.34)',
      portBorder: 'rgba(162, 207, 255, 0.14)',
      portBackground: 'rgba(8, 24, 46, 0.26)'
    },
    sidebar: {
      panelBorder: 'rgba(182, 223, 255, 0.22)',
      panelBackground:
        'linear-gradient(155deg, rgba(18, 40, 67, 0.82) 0%, rgba(9, 26, 49, 0.72) 100%)',
      panelShadow: '0 24px 46px rgba(2, 10, 26, 0.45), inset 0 1px 0 rgba(190, 232, 255, 0.14)',
      versionBadgeBackground: 'rgba(10, 31, 58, 0.56)',
      versionBadgeBorder: 'rgba(167, 218, 255, 0.2)'
    },
    menu: {
      activeBackground:
        'linear-gradient(135deg, rgba(0, 151, 245, 0.24) 0%, rgba(0, 210, 189, 0.18) 100%)',
      activeBorder: 'rgba(144, 205, 255, 0.34)',
      activeShadow: '0 10px 26px rgba(1, 15, 34, 0.42), inset 0 1px 0 rgba(170, 221, 255, 0.18)',
      activeMarker: 'linear-gradient(180deg, #00b4ff 0%, #04d8c5 100%)',
      hoverBackground: 'rgba(14, 39, 68, 0.7)',
      hoverBorder: 'rgba(143, 199, 255, 0.28)',
      hoverInnerBorder: 'rgba(143, 199, 255, 0.2)',
      focusRing: 'rgba(78, 169, 255, 0.28)',
      iconActiveBorder: 'rgba(150, 216, 255, 0.34)',
      iconActiveBackground:
        'linear-gradient(140deg, rgba(8, 28, 53, 0.88) 0%, rgba(11, 36, 68, 0.76) 100%)',
      iconDefaultBackground: 'rgba(7, 25, 48, 0.36)',
      iconActiveColor: '#72ceff',
      iconActiveShadow: '0 8px 18px rgba(3, 11, 25, 0.45)'
    },
    link: {
      default: '#2f87ff',
      hover: '#52a4ff',
      active: '#2580f2',
      focusRing: 'rgba(82, 164, 255, 0.36)'
    },
    table: {
      border: 'rgba(160, 203, 255, 0.16)',
      headerBg: 'rgba(11, 33, 63, 0.88)',
      headerSplit: 'rgba(160, 203, 255, 0.15)',
      rowHover: 'rgba(10, 38, 76, 0.62)',
      rowExpanded: 'rgba(9, 33, 64, 0.66)',
      rowBorder: 'rgba(162, 207, 255, 0.14)'
    },
    changelog: {
      new: '#78cfff',
      improve: '#7fdac7',
      update: '#a9c8f2',
      fix: '#d7a7a5'
    }
  }
}

// Backward-compatible export for places that still import `palette` directly.
export const palette = lightPalette
