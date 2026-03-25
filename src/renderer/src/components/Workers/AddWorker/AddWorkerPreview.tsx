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
import { Flex } from '@renderer/ui-kit/Flex'
import { Text } from '@renderer/ui-kit/Typography'
import { styled } from 'styled-components'
import { AddWorkerFields, AddWorkerFormValuesT, DelegateRulesT } from '@renderer/types/workers'
import { Node, Type as NodeType } from '@renderer/types/node'
import { DelegateRules as DelegateRulesComponent } from '../../DelegateRules'
export const AddWorkerPreview: React.FC<{
  data: AddWorkerFormValuesT
  node?: Node
  deposit?: {
    depositDataCount?: number
    delegateRules?: DelegateRulesT
  }
}> = ({ data, node, deposit }) => {
  return (
    <TabContentWrapper>
      <TextRow label="Node" value={node?.name || data[AddWorkerFields.node]} />
      {node && node.type === NodeType.local && (
        <>
          <TextRow
            label="Mnemonic"
            value={Object.values(data[AddWorkerFields.mnemonicVerify]).join(' ')}
          />
          <TextRow label="Withdrawal Address" value={data[AddWorkerFields.withdrawalAddress]} />
          <TextRow label="Amount" value={data[AddWorkerFields.amount]} />
        </>
      )}
      {deposit && !!deposit.depositDataCount && (
        <>
          <TextRow label="Amount" value={deposit.depositDataCount} />
          {deposit.delegateRules && (
            <DelegateRulesComponent delegateRules={deposit.delegateRules} />
          )}
        </>
      )}
    </TabContentWrapper>
  )
}

const TabContentWrapper = styled.div`
  //padding: 30px 30px 15px 5px;
  /* border: 1px solid ${({ theme }) => theme.palette.background.gray}; */

  //border-bottom-right-radius: 4px;
  //border-bottom-left-radius: 4px;
`
export const TextRow: React.FC<{ label: string; value?: string | number | React.ReactNode }> = ({
  label,
  value
}) => {
  return (
    <TextItem gap={6} align="center">
      <TextLabel>{label}:</TextLabel>
      <Text>{value}</Text>
    </TextItem>
  )
}

const TextLabel = styled(Text)`
  min-width: 150px;
`

const TextItem = styled(Flex)`
  margin-bottom: 20px;
`
