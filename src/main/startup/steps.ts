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

import type { StartupStep } from './types'

interface CreateStartupStepsParams {
  runMigrations: () => Promise<unknown>
  checkForUpdates: () => void
  initializeSettings: () => Promise<unknown>
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
  initializeSettings,
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
    title: 'Initializing settings service',
    detail: 'Registering settings IPC handlers.',
    run: async () => await initializeSettings()
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
