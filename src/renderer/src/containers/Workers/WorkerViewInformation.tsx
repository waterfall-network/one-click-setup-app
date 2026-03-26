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
import { TabContent, TabTextRow } from '@renderer/ui-kit/Tabs'
import { Flex } from '@renderer/ui-kit/Flex'
import { Button } from '@renderer/ui-kit/Button'
import { Text } from '@renderer/ui-kit/Typography'
import { WorkerViewTabProps } from '@renderer/types/workers'
import { getStatusLabel } from '../../helpers/workers'
import { useCopy } from '../../hooks/common'
import { Link } from '@renderer/ui-kit/Link'
import { getViewLink } from '@renderer/helpers/navigation'
import { routes } from '@renderer/constants/navigation'
import { styled } from 'styled-components'

export const WorkerViewInformation: React.FC<WorkerViewTabProps> = ({ item }) => {
  const [copyWithdrawalAddressStatus, handleyWithdrawalAddressCopy] = useCopy(
    item?.withdrawalAddress ? `0x${item.withdrawalAddress}` : undefined
  )
  const [copySignatureStatus, handleSignatureCopy] = useCopy(
    item?.signature ? `0x${item.signature}` : undefined
  )
  return (
    <TabContent variant="text">
      <TabTextRow label="ID" value={item?.id ? item?.id.toString() : '-'} />
      <TabTextRow
        label="Index"
        value={item?.validatorIndex ? item?.validatorIndex.toString() : '-'}
      />
      <TabTextRow
        label="Node"
        value={
          item ? (
            <Link to={getViewLink(routes.nodes.view, { id: item.nodeId.toString() })}>
              {item.node?.name || `Node #${item.nodeId}`}
            </Link>
          ) : (
            '-'
          )
        }
      />
      <TabTextRow label="Status" value={item ? getStatusLabel(item) : '-'} />
      <TabTextRow
        label="Withdrawal address"
        value={
          <Flex align="center" gap={12}>
            <Text>{item?.withdrawalAddress ? `0x${item?.withdrawalAddress}` : '-'}</Text>
            <Button type="dashed" onClick={handleyWithdrawalAddressCopy}>
              {copyWithdrawalAddressStatus ? 'Copied' : 'Copy'}
            </Button>
          </Flex>
        }
      />
      <TabTextRow
        label="Signature"
        value={
          <Flex align="center" gap={12}>
            <SignatureText>{item?.signature ? `0x${item?.signature}` : '-'}</SignatureText>
            <Button type="dashed" onClick={handleSignatureCopy}>
              {copySignatureStatus ? 'Copied' : 'Copy'}
            </Button>
          </Flex>
        }
      />
      {/*<TabTextRow label="Potential future rewards" value="Per Year/Day/Epoch" />*/}
      {/*<TabTextRow label="Earned Rewards" value="Day, Week, Month, Year" />*/}
    </TabContent>
  )
}

const SignatureText = styled(Text)`
  width: 600px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
