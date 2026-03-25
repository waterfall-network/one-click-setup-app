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
export const selectDirectory = async (defaultPath?: string): Promise<string | null> => {
  return await window.os.selectDirectory(defaultPath)
}

export const saveTextFile = async (
  text: string,
  title?: string,
  fileName?: string,
  filters?: { name: string; extensions: string[] }[]
): Promise<boolean> => {
  return await window.os.saveTextFile(text, title, fileName, filters)
}

export const selectSavePath = async (
  title?: string,
  fileName?: string,
  filters?: { name: string; extensions: string[] }[]
): Promise<string | null> => {
  return await window.os.selectSavePath(title, fileName, filters)
}

export const openExternal = (url: string): void => window.os.openExternal(url)

export const selectFile = async (
  defaultPath?: string,
  filters?: { name: string; extensions: string[] }[]
): Promise<string | null> => {
  return await window.os.selectFile(defaultPath, filters)
}
