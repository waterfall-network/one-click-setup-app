/*
 * Copyright 2026   Blue Wave Inc.
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
import { Modal } from '@renderer/ui-kit/Modal'
import { selectFile, selectSavePath } from '@renderer/api/os'
import { getAll as getAllNodes, stop as stopNode } from '@renderer/api/node'
import { Settings } from '@renderer/types/settings'
import {
  CoordinatorStatus,
  CoordinatorValidatorStatus,
  Node,
  ValidatorStatus
} from '@renderer/types/node'
import {
  useExportConfig,
  useExportMainLog,
  useGetSettings,
  useImportConfig,
  useResetFactory,
  useUpdateSettings
} from './settings'
import { SyncProgressState } from '@renderer/components/Settings/SyncProgressModal'

type ModalApi = ReturnType<typeof Modal.useModal>[0]

const DEFAULT_SETTINGS: Settings = {
  id: 1,
  theme: 'system',
  autoStartApp: true,
  autoStartNodes: true,
  monitoringInterval: 12000,
  logLevel: 'debug',
  binariesPath: '',
  createdAt: '',
  updatedAt: ''
}

const INITIAL_SYNC_PROGRESS: SyncProgressState = {
  open: false,
  mode: 'export',
  status: 'running',
  percent: 0,
  message: '',
  nodes: 0,
  validators: 0,
  exportPath: null,
  importPath: null
}

const isNodeRunning = (node: Node): boolean => {
  return (
    node.coordinatorStatus !== CoordinatorStatus.stopped ||
    node.validatorStatus !== ValidatorStatus.stopped ||
    node.coordinatorValidatorStatus !== CoordinatorValidatorStatus.stopped
  )
}

export const useSettingsPage = (modal: ModalApi) => {
  const [settingsForm, setSettingsForm] = useState<Settings>(DEFAULT_SETTINGS)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [syncProgress, setSyncProgress] = useState<SyncProgressState>(INITIAL_SYNC_PROGRESS)

  const { isLoading, data, error } = useGetSettings()
  const updateMutation = useUpdateSettings()
  const exportMutation = useExportConfig()
  const exportMainLogMutation = useExportMainLog()
  const importMutation = useImportConfig()
  const resetFactoryMutation = useResetFactory()

  useEffect(() => {
    if (data) {
      setSettingsForm(data)
      return
    }
    if (!data && !isLoading) {
      setSettingsForm(DEFAULT_SETTINGS)
    }
  }, [data, isLoading])

  const updateSettingsField = async (
    patch: Partial<
      Pick<
        Settings,
        | 'theme'
        | 'autoStartApp'
        | 'autoStartNodes'
        | 'monitoringInterval'
        | 'logLevel'
        | 'binariesPath'
      >
    >
  ) => {
    setStatus(null)
    setSettingsForm((prev) => ({ ...prev, ...patch }))

    try {
      const result = await updateMutation.mutateAsync(patch)
      if (!result) {
        setStatus({ type: 'error', message: 'Failed to update settings.' })
        return
      }
      setSettingsForm(result)
    } catch {
      setStatus({ type: 'error', message: 'Failed to update settings.' })
    }
  }

  const handleExportMainLog = async () => {
    setStatus(null)
    try {
      const filePath = await selectSavePath('Save application log', 'waterfall-main.log', [
        { name: 'Log Files', extensions: ['log'] }
      ])
      if (!filePath) {
        return
      }
      const result = await exportMainLogMutation.mutateAsync(filePath)
      if (!result.saved) {
        setStatus({ type: 'error', message: 'Failed to save main log file.' })
        return
      }
      setStatus({ type: 'success', message: 'Main log file saved.' })
    } catch {
      setStatus({ type: 'error', message: 'Failed to save main log file.' })
    }
  }

  const handleExport = async () => {
    setStatus(null)
    try {
      const filePath = await selectSavePath('Export configuration', 'waterfall-config.json', [
        { name: 'JSON Files', extensions: ['json'] }
      ])
      if (!filePath) {
        setStatus({ type: 'error', message: 'Export was cancelled or failed.' })
        return
      }

      setSyncProgress({
        open: true,
        mode: 'export',
        status: 'running',
        percent: 70,
        message: 'Finalizing export...',
        nodes: 0,
        validators: 0,
        exportPath: filePath,
        importPath: null
      })

      const result = await exportMutation.mutateAsync(filePath)
      if (!result.saved) {
        setSyncProgress({
          ...INITIAL_SYNC_PROGRESS,
          open: true,
          mode: 'export',
          status: 'error',
          percent: 100,
          message: 'Failed to save export file.'
        })
        setStatus({ type: 'error', message: 'Export failed.' })
        return
      }

      setSyncProgress({
        open: true,
        mode: 'export',
        status: 'done',
        percent: 100,
        message: 'Export completed successfully.',
        nodes: result.exportedNodes,
        validators: result.exportedWorkers,
        exportPath: filePath,
        importPath: null
      })
      setStatus({ type: 'success', message: 'Configuration exported.' })
    } catch {
      setSyncProgress({
        ...INITIAL_SYNC_PROGRESS,
        open: true,
        mode: 'export',
        status: 'error',
        percent: 100,
        message: 'Failed to export configuration.'
      })
      setStatus({ type: 'error', message: 'Failed to export configuration.' })
    }
  }

  const handleImport = async () => {
    setStatus(null)
    const importPath = await selectFile(undefined, [{ name: 'JSON Files', extensions: ['json'] }])
    if (!importPath) {
      return
    }

    try {
      setSyncProgress({
        open: true,
        mode: 'import',
        status: 'running',
        percent: 20,
        message: 'Loading backup file...',
        nodes: 0,
        validators: 0,
        exportPath: null,
        importPath
      })
      setSyncProgress((prev) => ({
        ...prev,
        percent: 75,
        message: 'Applying backup...'
      }))
      const result = await importMutation.mutateAsync(importPath)

      setSettingsForm((prev) => result.settings ?? prev)
      setSyncProgress({
        open: true,
        mode: 'import',
        status: 'done',
        percent: 100,
        message: 'Import completed successfully.',
        nodes: result.importedNodes,
        validators: result.importedWorkers,
        exportPath: null,
        importPath
      })
      setStatus({ type: 'success', message: 'Configuration imported.' })
    } catch {
      setSyncProgress({
        ...INITIAL_SYNC_PROGRESS,
        open: true,
        mode: 'import',
        status: 'error',
        percent: 100,
        message: 'Failed to import configuration file.'
      })
      setStatus({ type: 'error', message: 'Failed to import configuration file.' })
    }
  }

  const runFactoryReset = async () => {
    setStatus(null)
    const result = await resetFactoryMutation.mutateAsync()
    if (!result) {
      setStatus({
        type: 'error',
        message: 'Failed to reset application data.'
      })
      return
    }
    setSettingsForm(result)
    setStatus({ type: 'success', message: 'Application reset to factory defaults.' })
    modal.success({
      title: 'Factory reset completed',
      content: 'All local nodes and validators were removed. Default settings were restored.',
      centered: true
    })
  }

  const handleResetFactory = () => {
    const confirmReset = async () => {
      const nodes = await getAllNodes()
      const runningNodes = nodes.filter(isNodeRunning)
      if (runningNodes.length === 0) {
        await runFactoryReset()
        return
      }

      modal.confirm({
        title: 'Some nodes are running',
        content:
          'To continue factory reset, running nodes must be stopped. Do you want to stop them now?',
        okText: 'Stop and continue',
        okButtonProps: { danger: true },
        cancelText: 'Cancel',
        centered: true,
        onOk: async () => {
          try {
            for (const node of runningNodes) {
              await stopNode(node.id)
            }
            await runFactoryReset()
          } catch {
            setStatus({
              type: 'error',
              message: 'Failed to stop running nodes before reset.'
            })
          }
        }
      })
    }

    modal.confirm({
      title: 'Reset application to factory defaults?',
      content:
        'This will permanently delete all nodes and validators from local database and restore default settings.',
      okText: 'Reset',
      okButtonProps: { danger: true, loading: resetFactoryMutation.isPending },
      cancelText: 'Cancel',
      centered: true,
      onOk: confirmReset
    })
  }

  return {
    isLoading,
    error,
    status,
    setSettingsForm,
    settingsForm,
    syncProgress,
    setSyncProgress,
    updateSettingsField,
    handleExportMainLog,
    handleExport,
    handleImport,
    handleResetFactory,
    exportPending: exportMutation.isPending,
    exportMainLogPending: exportMainLogMutation.isPending,
    importPending: importMutation.isPending,
    resetPending: resetFactoryMutation.isPending
  }
}
