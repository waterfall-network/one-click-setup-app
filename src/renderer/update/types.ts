export type StartupPhase = 'running' | 'done' | 'error'

export interface StartupStatus {
  phase: StartupPhase
  title: string
  detail: string
  activeStep: number
  completedSteps: number
  totalSteps: number
}
