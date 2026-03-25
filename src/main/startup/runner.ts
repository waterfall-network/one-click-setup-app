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

import type { StartupStatus, StartupStep } from './types'

interface RunStartupParams {
  steps: StartupStep[]
  delayMs?: number
  publishStatus: (status: StartupStatus) => void
  onStepDone?: (step: StartupStep) => void
  onStepFailed?: (step: StartupStep, error: unknown) => void
  doneTitle?: string
  doneDetail: string
}

const sleep = async (ms: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

const formatStartupError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

export const runStartup = async ({
  steps,
  delayMs = 0,
  publishStatus,
  onStepDone,
  onStepFailed,
  doneTitle = 'Startup complete',
  doneDetail
}: RunStartupParams): Promise<boolean> => {
  const totalSteps = steps.length
  for (const [index, step] of steps.entries()) {
    const activeStep = index + 1
    publishStatus({
      phase: 'running',
      title: step.title,
      detail: step.detail,
      activeStep,
      completedSteps: index,
      totalSteps
    })
    if (delayMs > 0) {
      await sleep(delayMs)
    }
    // Build a progress callback so steps can stream detail updates to the UI
    // without waiting for the next step boundary.
    const updateProgress = (detail: string): void => {
      publishStatus({
        phase: 'running',
        title: step.title,
        detail,
        activeStep,
        completedSteps: index,
        totalSteps
      })
    }

    try {
      await Promise.resolve(step.run(updateProgress))
      onStepDone?.(step)
    } catch (error) {
      onStepFailed?.(step, error)
      publishStatus({
        phase: 'error',
        title: `Startup failed at step ${activeStep}/${totalSteps}`,
        detail: `${step.title}: ${formatStartupError(error)}`,
        activeStep,
        completedSteps: index,
        totalSteps
      })
      return false
    }
  }

  publishStatus({
    phase: 'done',
    title: doneTitle,
    detail: doneDetail,
    activeStep: totalSteps,
    completedSteps: totalSteps,
    totalSteps
  })
  return true
}
