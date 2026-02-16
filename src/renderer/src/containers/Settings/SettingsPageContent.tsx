/*
 * Copyright 2024   Blue Wave Inc.
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
import { Modal } from '@renderer/ui-kit/Modal'
import { Space } from '@renderer/ui-kit/Space'
import { PageBody } from '@renderer/components/Page/Body'
import { Alert } from '@renderer/ui-kit/Alert'
import { AppearanceSettingsCard } from '@renderer/components/Settings/AppearanceSettingsCard'
import { StartupSettingsCard } from '@renderer/components/Settings/StartupSettingsCard'
import { MonitoringSettingsCard } from '@renderer/components/Settings/MonitoringSettingsCard'
import { BackupSettingsCard } from '@renderer/components/Settings/BackupSettingsCard'
import { DangerZoneSettingsCard } from '@renderer/components/Settings/DangerZoneSettingsCard'
import { SyncProgressModal } from '@renderer/components/Settings/SyncProgressModal'
import { useSettingsPage } from '@renderer/hooks/settingsPage'

const INTERVAL_MIN = 5000
const INTERVAL_MAX = 60000

export const SettingsPageContent = () => {
  const [modal, contextHolder] = Modal.useModal()
  const {
    isLoading,
    error,
    status,
    settingsForm,
    setSettingsForm,
    syncProgress,
    setSyncProgress,
    updateSettingsField,
    handleExport,
    handleImport,
    handleResetFactory,
    exportPending,
    importPending,
    resetPending
  } = useSettingsPage(modal)

  return (
    <PageBody isLoading={isLoading}>
      {contextHolder}
      <Space orientation="vertical" size={16} style={{ width: '100%' }}>
        {(error || status) && (
          <Alert
            type={status?.type || 'error'}
            title={status?.message || error?.message}
            showIcon
          />
        )}

        <AppearanceSettingsCard
          theme={settingsForm.theme}
          onThemeChange={(theme) => void updateSettingsField({ theme })}
        />

        <StartupSettingsCard
          autoStartApp={settingsForm.autoStartApp}
          autoStartNodes={settingsForm.autoStartNodes}
          onAutoStartAppChange={(checked) => void updateSettingsField({ autoStartApp: checked })}
          onAutoStartNodesChange={(checked) =>
            void updateSettingsField({ autoStartNodes: checked })
          }
        />

        <MonitoringSettingsCard
          monitoringInterval={settingsForm.monitoringInterval}
          intervalMin={INTERVAL_MIN}
          intervalMax={INTERVAL_MAX}
          onIntervalChange={(value) =>
            setSettingsForm((prev) => ({ ...prev, monitoringInterval: value }))
          }
          onIntervalCommit={(value) => void updateSettingsField({ monitoringInterval: value })}
        />

        <BackupSettingsCard
          onExport={() => void handleExport()}
          onImport={() => void handleImport()}
          exportLoading={exportPending}
          importLoading={importPending}
        />

        <DangerZoneSettingsCard onResetFactory={handleResetFactory} loading={resetPending} />
      </Space>

      <SyncProgressModal
        value={syncProgress}
        onClose={() => setSyncProgress((prev) => ({ ...prev, open: false }))}
      />
    </PageBody>
  )
}
