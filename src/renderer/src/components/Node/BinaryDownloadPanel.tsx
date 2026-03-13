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
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { styled } from 'styled-components'
import { Alert } from '@renderer/ui-kit/Alert'
import { ButtonPrimary } from '@renderer/ui-kit/Button'
import { Text } from '@renderer/ui-kit/Typography'
import {
  getBinaryStatus,
  downloadBinaries,
  onBinaryProgress,
  type BinaryStatus,
  type DownloadProgress
} from '@renderer/api/node'

const formatMb = (bytes: number) => (bytes / 1_048_576).toFixed(0)

type BinaryDownloadPanelProps = {
  onReady: () => void
}

/** Panel that checks and, if needed, downloads Linux node binaries before the node is created */
const BinaryDownloadPanel: React.FC<BinaryDownloadPanelProps> = ({ onReady }) => {
  const [status, setStatus] = useState<BinaryStatus | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState<DownloadProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const unsubRef = useRef<(() => void) | null>(null)

  const checkStatus = useCallback(async () => {
    try {
      const s = await getBinaryStatus()
      setStatus(s)
      if (s.ready) onReady()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [onReady])

  useEffect(() => {
    checkStatus()
    return () => {
      unsubRef.current?.()
    }
  }, [checkStatus])

  const handleDownload = async () => {
    setError(null)
    setDownloading(true)
    unsubRef.current = onBinaryProgress((p) => setProgress(p))
    try {
      await downloadBinaries()
      unsubRef.current?.()
      unsubRef.current = null
      setDownloading(false)
      await checkStatus()
    } catch (e) {
      unsubRef.current?.()
      unsubRef.current = null
      setDownloading(false)
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  const progressLabel = (() => {
    if (!progress) return null
    if (progress.phase === 'checking') return `Checking ${progress.file}…`
    if (progress.phase === 'verifying') return `Verifying ${progress.file}…`
    if (progress.phase === 'installed') return `${progress.file} — installed`
    if (progress.phase === 'up_to_date') return `${progress.file} — up-to-date`
    if (progress.phase === 'downloading') {
      const pct = progress.total > 0 ? Math.round((progress.received / progress.total) * 100) : 0
      const mb = (progress.received / 1_048_576).toFixed(1)
      const tot = (progress.total / 1_048_576).toFixed(1)
      return `Downloading ${progress.file}: ${mb} / ${tot} MB (${pct}%)`
    }
    return null
  })()

  if (status === null) {
    return (
      <Wrap>
        <Text size="sm">Checking node binaries…</Text>
      </Wrap>
    )
  }

  if (status.ready) return null

  const totalMb = status.files.reduce((s, f) => s + f.size, 0)

  return (
    <Wrap>
      <Alert
        type="warning"
        title={`Node binaries are required (~${formatMb(totalMb)} MB total).`}
      />
      <FileList>
        {status.files.map((f) => (
          <FileRow key={f.name}>
            <Text size="sm">{f.name}</Text>
            <Text size="sm">{f.exists ? '✓ present' : `${formatMb(f.size)} MB — missing`}</Text>
          </FileRow>
        ))}
      </FileList>
      {progressLabel && <Text size="xsm">{progressLabel}</Text>}
      {error && <Alert type="error" title={`Download failed: ${error}`} />}
      <ButtonPrimary onClick={handleDownload} disabled={downloading}>
        {downloading ? 'Downloading…' : error ? 'Retry download' : 'Download binaries'}
      </ButtonPrimary>
    </Wrap>
  )
}

export default BinaryDownloadPanel

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
`

const FileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  opacity: 0.85;
`

const FileRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
`
