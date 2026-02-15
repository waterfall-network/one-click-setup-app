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
    try {
      await Promise.resolve(step.run())
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
