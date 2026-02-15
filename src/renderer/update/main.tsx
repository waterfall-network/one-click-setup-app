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
