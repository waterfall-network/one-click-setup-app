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
import React from 'react'
import { useGetSettings } from './settings'

const getSystemDarkMode = (): boolean => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export const useIsDarkTheme = (): boolean => {
  const { data: settings } = useGetSettings()
  const [isSystemDark, setIsSystemDark] = React.useState<boolean>(getSystemDarkMode())

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event: MediaQueryListEvent): void => {
      setIsSystemDark(event.matches)
    }

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', onChange)
      return () => {
        mediaQuery.removeEventListener('change', onChange)
      }
    }

    mediaQuery.addListener(onChange)
    return () => {
      mediaQuery.removeListener(onChange)
    }
  }, [])

  const themeMode = settings?.theme ?? 'system'
  return themeMode === 'dark' || (themeMode === 'system' && isSystemDark)
}
