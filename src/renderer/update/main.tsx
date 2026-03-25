/*
 * Copyright 2026 Digital Clever Solution Inc.
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

import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { UpdateApp } from './App'
import './styles.css'
import type { StartupStatus } from './types'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Update root element is missing')
}

const initialStatus: StartupStatus = {
  phase: 'running',
  title: 'Please wait. Update in progress...',
  detail: 'Installing improvements and preparing your workspace.',
  activeStep: 0,
  completedSteps: 0,
  totalSteps: 0
}

const UpdatePage = () => {
  const [status, setStatus] = useState<StartupStatus>(initialStatus)

  useEffect(() => {
    const unsubscribe = window.startup.onStatus((nextStatus) => {
      setStatus(nextStatus)
    })
    return () => {
      unsubscribe()
    }
  }, [])

  return <UpdateApp status={status} />
}

createRoot(rootElement).render(<UpdatePage />)
