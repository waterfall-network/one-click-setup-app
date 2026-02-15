import type { StartupStep } from './types'

interface CreateStartupStepsParams {
  runMigrations: () => Promise<unknown>
  checkForUpdates: () => void
  initializeNode: () => Promise<unknown>
  initializeWorker: () => Promise<unknown>
  initializeFsHandle: () => void
  startStatusWorker: () => void
  startSnapshotWorker: () => void
  configurePowerManagement: () => void
  finalizeApplicationShell: () => void
}

export const createStartupSteps = ({
  runMigrations,
  checkForUpdates,
  initializeNode,
  initializeWorker,
  initializeFsHandle,
  startStatusWorker,
  startSnapshotWorker,
  configurePowerManagement,
  finalizeApplicationShell
}: CreateStartupStepsParams): StartupStep[] => [
  {
    title: 'Preparing database',
    detail: 'Running data migrations.',
    run: async () => await runMigrations()
  },
  {
    title: 'Checking for updates',
    detail: 'Contacting update service.',
    run: () => {
      checkForUpdates()
    }
  },
  {
    title: 'Initializing node service',
    detail: 'Starting blockchain node engine.',
    run: async () => await initializeNode()
  },
  {
    title: 'Initializing worker service',
    detail: 'Starting background worker.',
    run: async () => await initializeWorker()
  },
  {
    title: 'Initializing file subsystem',
    detail: 'Preparing filesystem bridge.',
    run: () => {
      initializeFsHandle()
    }
  },
  {
    title: 'Starting status monitor',
    detail: 'Enabling runtime status polling.',
    run: () => {
      startStatusWorker()
    }
  },
  {
    title: 'Starting snapshot monitor',
    detail: 'Scheduling snapshot checks.',
    run: () => {
      startSnapshotWorker()
    }
  },
  {
    title: 'Configuring power management',
    detail: 'Preventing system sleep during startup.',
    run: () => {
      configurePowerManagement()
    }
  },
  {
    title: 'Finalizing application shell',
    detail: 'Creating tray and IPC handlers.',
    run: () => {
      finalizeApplicationShell()
    }
  }
]
