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
import React from 'react'
import { NodeViewTabProps } from '@renderer/types/node'
import { TabContent, TabTextRow } from '@renderer/ui-kit/Tabs'
import { getEpochFromSlot, getSlotFromEpoch } from '@renderer/helpers/network'

export const NodeViewCoordinator: React.FC<NodeViewTabProps> = ({ item }) => {
  return (
    <TabContent variant="text">
      <TabTextRow label="Status" value={item?.coordinatorStatus} />
      <TabTextRow label="Peers" value={item?.coordinatorPeersCount} />
      <TabTextRow
        label="Current Slot (Epoch)"
        value={
          item?.coordinatorHeadSlot
            ? `${item.coordinatorHeadSlot} (${getEpochFromSlot(item.coordinatorHeadSlot)})`
            : '-'
        }
      />
      <TabTextRow
        label="Finalized Slot (Epoch)"
        value={
          item?.coordinatorFinalizedEpoch
            ? `${getSlotFromEpoch(item.coordinatorFinalizedEpoch)} (${item.coordinatorFinalizedEpoch})`
            : '-'
        }
      />
      <TabTextRow
        label="Distance"
        value={item?.coordinatorSyncDistance ? item.coordinatorSyncDistance.toString() : '-'}
      />
    </TabContent>
  )
}
