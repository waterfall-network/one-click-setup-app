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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  exportConfig,
  exportMainLog,
  getSettings,
  importConfigFile,
  resetFactory,
  updateSettings
} from '@renderer/api/settings'
import { UpdateSettings } from '@renderer/types/settings'

export const settingsQueryKey = ['settings'] as const

export const useGetSettings = () => {
  return useQuery({
    queryKey: settingsQueryKey,
    queryFn: getSettings
  })
}

export const useMonitoringInterval = (): number => {
  const { data } = useGetSettings()
  return data?.monitoringInterval ?? 12000
}

export const useUpdateSettings = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateSettings) => await updateSettings(data),
    onSuccess: (settings) => {
      queryClient.setQueryData(settingsQueryKey, settings)
    }
  })
}

export const useExportConfig = () => {
  return useMutation({
    mutationFn: exportConfig
  })
}

export const useImportConfig = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (filePath: string) => await importConfigFile(filePath),
    onSuccess: (result) => {
      queryClient.setQueryData(settingsQueryKey, result.settings)
      void queryClient.invalidateQueries({ queryKey: ['node:all'] })
      void queryClient.invalidateQueries({ queryKey: ['node:one'] })
      void queryClient.invalidateQueries({ queryKey: ['workers:all'] })
      void queryClient.invalidateQueries({ queryKey: ['workers:node'] })
      void queryClient.invalidateQueries({ queryKey: ['workers:stats'] })
      void queryClient.invalidateQueries({ queryKey: ['worker:one'] })
    }
  })
}

export const useExportMainLog = () => {
  return useMutation({
    mutationFn: exportMainLog
  })
}

export const useResetFactory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: resetFactory,
    onSuccess: (settings) => {
      queryClient.setQueryData(settingsQueryKey, settings)
      void queryClient.invalidateQueries({ queryKey: ['node:all'] })
      void queryClient.invalidateQueries({ queryKey: ['node:one'] })
      void queryClient.invalidateQueries({ queryKey: ['workers:all'] })
      void queryClient.invalidateQueries({ queryKey: ['workers:node'] })
      void queryClient.invalidateQueries({ queryKey: ['workers:stats'] })
      void queryClient.invalidateQueries({ queryKey: ['worker:one'] })
    }
  })
}
