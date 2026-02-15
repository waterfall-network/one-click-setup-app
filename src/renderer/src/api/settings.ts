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
import {
  ExportConfigResult,
  ImportConfigResult,
  Settings,
  UpdateSettings
} from '@renderer/types/settings'

export const getSettings = async (): Promise<Settings | null> => {
  return await window.settings.get()
}

export const updateSettings = async (data: UpdateSettings): Promise<Settings | null> => {
  return await window.settings.update(data)
}

export const exportConfig = async (filePath: string): Promise<ExportConfigResult> => {
  return await window.settings.exportConfig(filePath)
}

export const importConfigFile = async (filePath: string): Promise<ImportConfigResult> => {
  return await window.settings.importConfigFile(filePath)
}

export const resetFactory = async (): Promise<Settings | null> => {
  return await window.settings.resetFactory()
}
