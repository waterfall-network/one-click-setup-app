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
import React from 'react'
import { AppLayout } from './containers/Layout'
import { AppNavigator } from './containers/Navigator/AppNavigator'
import { ThemeProvider } from 'styled-components'
import { theme } from './ui-kit/theme'
import { HashRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
})
function App(): React.JSX.Element {
  return (
    <HashRouter>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <AppLayout>
            <AppNavigator />
          </AppLayout>
        </QueryClientProvider>
      </ThemeProvider>
    </HashRouter>
  )
}

export default App
