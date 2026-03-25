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
import { NodeViewTabProps } from '@renderer/types/node'
import { TabContent, TabTextRow } from '@renderer/ui-kit/Tabs'
import { getDateTime } from '@renderer/helpers/date'
import { getNodeStatusLabel } from '@renderer/helpers/node'

export const NodeViewInformation: React.FC<NodeViewTabProps> = ({ item }) => {
  return (
    <TabContent variant="text">
      <TabTextRow label="ID" value={item?.id ? item?.id.toString() : '-'} />
      <TabTextRow label="Name" value={item?.name} />
      <TabTextRow label="Status" value={item ? getNodeStatusLabel(item) : 'unknown'} />
      <TabTextRow label="Type" value={item?.type} />
      <TabTextRow label="Network" value={item?.network} />
      <TabTextRow label="Location" value={item?.locationDir} />
      <TabTextRow label="Last Validator Index" value={item?.workersCount} />
      <TabTextRow label="Added" value={item?.createdAt ? getDateTime(item.createdAt) : '-'} />
    </TabContent>
  )
}
