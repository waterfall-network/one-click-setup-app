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
import { useEffect, useState } from 'react'

export const useCopy = (text?: string): [boolean, () => void] => {
  const [status, setStatus] = useState(false)
  const handleCopy = () => {
    if (text) {
      navigator.clipboard.writeText(text)
      setStatus(true)
      return true
    }
    return false
  }
  useEffect(() => {
    if (status) setTimeout(() => setStatus(false), 2500)
  }, [status])
  return [status, handleCopy]
}
