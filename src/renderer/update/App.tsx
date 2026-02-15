import type { StartupStatus } from './types'

interface UpdateAppProps {
  status: StartupStatus
}

const clampProgress = (completedSteps: number, totalSteps: number): number => {
  if (!totalSteps || totalSteps <= 0) {
    return 0
  }
  return Math.min(100, Math.max(0, (completedSteps / totalSteps) * 100))
}

const getCaption = (status: StartupStatus): string => {
  if (status.phase === 'done') {
    return `Step ${status.totalSteps}/${status.totalSteps}.`
  }
  if (status.phase === 'error') {
    return `Error on step ${status.activeStep}/${status.totalSteps}.`
  }
  return `Step ${status.activeStep}/${status.totalSteps}.`
}

export const UpdateApp = ({ status }: UpdateAppProps) => {
  const progress = clampProgress(status.completedSteps, status.totalSteps)
  const panelClassName = `panel${status.phase === 'error' ? ' is-error' : ''}${status.phase === 'done' ? ' is-done' : ''}`

  return (
    <main className={panelClassName}>
      <div className="brand">
        <img className="brand-logo" src="/logo.svg" alt="Waterfall logo" />
        <span>Waterfall</span>
      </div>
      <h1>{status.title}</h1>
      <p>{status.detail}</p>
      <div className="loader" role="status" aria-live="polite">
        <div className="spinner" aria-hidden="true"></div>
        <div className="track" aria-hidden="true">
          <div className="bar" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
      <div className="caption">{getCaption(status)}</div>
      <div className="error-detail">{status.phase === 'error' ? status.detail : ''}</div>
    </main>
  )
}
