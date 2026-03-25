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
        <img className="brand-logo" src="./logo.svg" alt="Waterfall logo" />
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
