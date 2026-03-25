/*
 * Copyright 2026 Digital Clever Solution Inc.
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
import React from 'react'
import { Alert } from '@renderer/ui-kit/Alert'
import { ButtonPrimary } from '@renderer/ui-kit/Button'
import { Text } from '@renderer/ui-kit/Typography'
import { Flex } from '@renderer/ui-kit/Flex'
import { useBinaryDownload } from '@renderer/hooks/node'

type BinaryDownloadPanelProps = {
  onReady: () => void
}

/** Panel that checks and, if needed, downloads Linux node binaries before the node is created */
const BinaryDownloadPanel: React.FC<BinaryDownloadPanelProps> = ({ onReady }) => {
  const { checking, downloading, error, onDownload } = useBinaryDownload(onReady)

  if (checking) {
    return (
      <Flex vertical gap={10} style={{ marginBottom: 16 }}>
        <Text size="sm">Checking node binaries…</Text>
      </Flex>
    )
  }

  return (
    <Flex vertical gap={10} style={{ marginBottom: 16 }}>
      <Alert type="warning" title="Node binaries are required. Please download them to continue." />
      {error && <Alert type="error" title={`Download failed: ${error}`} />}
      <ButtonPrimary onClick={onDownload} disabled={downloading}>
        {downloading ? 'Downloading…' : error ? 'Retry download' : 'Download binaries'}
      </ButtonPrimary>
    </Flex>
  )
}

export default BinaryDownloadPanel
