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
import React from 'react'
import { TabContent, TabTextRow } from '@renderer/ui-kit/Tabs'
import { WorkerViewTabProps } from '@renderer/types/workers'
import { useCopy } from '../../hooks/common'
import { Flex } from '@renderer/ui-kit/Flex'
import { Button } from '@renderer/ui-kit/Button'
import { Text } from '@renderer/ui-kit/Typography'
export const WorkerViewValidator: React.FC<WorkerViewTabProps> = ({ item }) => {
  const [copyStatus, handleCopy] = useCopy(
    item?.validatorAddress ? `0x${item.validatorAddress}` : undefined
  )
  return (
    <TabContent variant="text">
      <TabTextRow
        label="Public Key"
        value={
          <Flex align="center" gap={12}>
            <Text>{item?.validatorAddress ? `0x${item?.validatorAddress}` : '-'}</Text>
            <Button type="dashed" onClick={handleCopy}>
              {copyStatus ? 'Copied' : 'Copy'}
            </Button>
          </Flex>
        }
      />
      <TabTextRow
        label="Current balance"
        value={item ? `${parseFloat(item.validatorBalanceAmount).toFixed(2)} WATER` : '-'}
      />
      <TabTextRow
        label="Activation Epoch"
        value={item?.validatorActivationEpoch ? item.validatorActivationEpoch : '-'}
      />
      <TabTextRow
        label="Deactivation Epoch"
        value={item?.validatorDeActivationEpoch ? item.validatorDeActivationEpoch : '-'}
      />
      {/*<TabTextRow*/}
      {/*  label="Blocks created"*/}
      {/*  value={item?.validatorBlockCreationCount ? item.validatorBlockCreationCount : '-'}*/}
      {/*/>*/}
    </TabContent>
  )
}
