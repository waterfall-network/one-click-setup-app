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
import React from 'react'
import { TabContent, TabTextRow } from '@renderer/ui-kit/Tabs'
import { WorkerViewTabProps } from '@renderer/types/workers'
import { Flex } from '@renderer/ui-kit/Flex'
import { Button } from '@renderer/ui-kit/Button'
import { Text } from '@renderer/ui-kit/Typography'
import { styled } from 'styled-components'
import { useCopy } from '../../hooks/common'

export const WorkerViewCoordinator: React.FC<WorkerViewTabProps> = ({ item }) => {
  const [copyStatus, handleCopy] = useCopy(
    item?.coordinatorPublicKey ? `0x${item.coordinatorPublicKey}` : undefined
  )

  return (
    <TabContent variant="text">
      <TabTextRow
        label="Public Key"
        value={
          <Flex align="center" gap={12}>
            <CoordinatorPublicKeyText>
              {item?.coordinatorPublicKey ? `0x${item?.coordinatorPublicKey}` : '-'}
            </CoordinatorPublicKeyText>
            <Button type="dashed" onClick={handleCopy}>
              {copyStatus ? 'Copied' : 'Copy'}
            </Button>
          </Flex>
        }
      />

      <TabTextRow
        label="Stake size"
        value={item ? `${parseFloat(item.stakeAmount).toFixed(2)} WATER` : '-'}
      />
      <TabTextRow
        label="Current balance"
        value={item ? `${parseFloat(item.coordinatorBalanceAmount).toFixed(2)} WATER` : '-'}
      />
      <TabTextRow
        label="Activation Epoch"
        value={item?.coordinatorActivationEpoch ? item.coordinatorActivationEpoch : '-'}
      />
      <TabTextRow
        label="Deactivation Epoch"
        value={item?.coordinatorDeActivationEpoch ? item.coordinatorDeActivationEpoch : '-'}
      />
      {/*<TabTextRow*/}
      {/*  label="Blocks created"*/}
      {/*  value={item?.coordinatorBlockCreationCount ? item.coordinatorBlockCreationCount : '-'}*/}
      {/*/>*/}
      {/*<TabTextRow*/}
      {/*  label="Attestations created"*/}
      {/*  value={*/}
      {/*    item?.coordinatorAttestationCreationCount ? item.coordinatorAttestationCreationCount : '-'*/}
      {/*  }*/}
      {/*/>*/}
    </TabContent>
  )
}

const CoordinatorPublicKeyText = styled(Text)`
  width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
