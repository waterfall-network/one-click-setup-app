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
import { Space } from '@renderer/ui-kit/Space'
import { Flex } from '@renderer/ui-kit/Flex'
import { NetworkOptions } from '@renderer/constants/network'
import { DataFolder } from '@renderer/ui-kit/DataFolder'
import { Text } from '@renderer/ui-kit/Typography'
import { Input, InputNumber } from '@renderer/ui-kit/Input'
import { Radio, type RadioChangeEvent } from '@renderer/ui-kit/Radio'
import { Checkbox, type CheckboxProps } from '@renderer/ui-kit/Checkbox'
import { styled } from 'styled-components'
import { Type as NODE_TYPE, NewNode, AddNodeFields } from '@renderer/types/node'
import { IconButton } from '../../../ui-kit/Button'
import { ReloadOutlined } from '@ant-design/icons'
import { DownloadStatus, PortsNodeFields, Snapshot, Type } from '../../../types/node'
import { formatBytes } from '../../../helpers/common'

const node_type_options = [
  { value: NODE_TYPE.local, label: 'Local' },
  { value: NODE_TYPE.provider, label: 'Provider' },
  { value: NODE_TYPE.remote, label: 'Remote', disabled: true }
]

export const NodeTypeInput: React.FC<{
  value: string
  handleChange: (val: string) => void
}> = ({ handleChange, value }) => {
  const onChange = (e: RadioChangeEvent) => handleChange(e.target.value)
  return (
    <ChoiceGroup onChange={onChange} value={value}>
      <ChoiceList orientation="vertical" size={10}>
        {node_type_options.map((item) => (
          <ChoiceItem value={item.value} key={item.value} disabled={item?.disabled}>
            {item.label}
          </ChoiceItem>
        ))}
      </ChoiceList>
    </ChoiceGroup>
  )
}

export const NodeNetworkInput: React.FC<{
  value: string
  handleChange: (val: string) => void
}> = ({ handleChange, value }) => {
  const onChange = (e: RadioChangeEvent) => handleChange(e.target.value)
  return (
    <ChoiceGroup onChange={onChange} value={value}>
      <ChoiceList orientation="vertical" size={10}>
        {NetworkOptions.map((item) => (
          <ChoiceItem value={item.value} key={item.value} disabled={item?.disabled}>
            {item.label}
          </ChoiceItem>
        ))}
      </ChoiceList>
    </ChoiceGroup>
  )
}

export const NodeDataFolderInput: React.FC<{
  value: string
  handleChange: (val: string) => void
  onSelectDirectory: () => void
  error?: string
}> = ({ handleChange, value, onSelectDirectory, error }) => {
  return (
    <DataFolder
      value={value}
      handleChange={handleChange}
      onSelectDirectory={onSelectDirectory}
      errorMessage={error}
    />
  )
}

export const NodeSnapshotInput: React.FC<{
  value: boolean
  handleChange: () => void
  snapshot: Snapshot
  error?: string
}> = ({ handleChange, value, snapshot }) => {
  const onChange: CheckboxProps['onChange'] = () => handleChange()

  return (
    <Checkbox checked={value} onChange={onChange}>
      Download last Snapshot. You will need ~ {formatBytes(snapshot.size * 2)} of free disk space
    </Checkbox>
  )
}

export const NodeNameInput: React.FC<{
  value: string
  handleChange: (val: string) => void
  error?: string
}> = ({ handleChange, value }) => {
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => handleChange(e.target.value)

  return <StyledInput placeholder="Type Name here" onChange={onChange} value={value} />
}

export const NodePortInput: React.FC<{
  label: string
  value: number
  handleChange: (val: number | null) => void
  error?: string
  isCheck?: boolean
  onCheck: () => void
}> = ({ handleChange, label, value, isCheck, onCheck }) => {
  return (
    <PortRow gap={10} align="center">
      <Label>{label}:</Label>
      <PortInputWrap>
        <InputNumber
          placeholder="Type Port here"
          onChange={handleChange}
          value={value}
          status={isCheck ? undefined : 'warning'}
        />
      </PortInputWrap>
      <IconButton
        icon={<ReloadOutlined />}
        shape="default"
        size="middle"
        type="default"
        onClick={onCheck}
      />
    </PortRow>
  )
}

export const NodePreview: React.FC<{
  values: NewNode
}> = ({ values }) => {
  return (
    <TabContentWrapper>
      <PreviewTitle>Review your node settings</PreviewTitle>
      <TextRow label="Name" value={values[AddNodeFields.name]} />
      <TextRow label="Type" value={values[AddNodeFields.type]} />
      <TextRow label="Network" value={values[AddNodeFields.network]} />
      {values[AddNodeFields.type] === Type.local && (
        <>
          <TextRow label="Path" value={values[AddNodeFields.locationDir]} />
          <TextRow
            label="Download Last Snapshot"
            value={
              values[AddNodeFields.downloadStatus] === DownloadStatus.downloading ? 'Yes' : 'No'
            }
          />
          <TextRow
            label="Ports"
            value={Object.keys(PortsNodeFields)
              .map((key) => values[key])
              .join(', ')}
          />
        </>
      )}
      {values[AddNodeFields.type] === Type.provider && (
        <TextRow label="Provider Name" value={values[AddNodeFields.locationDir]} />
      )}
    </TabContentWrapper>
  )
}

const TabContentWrapper = styled.div`
  border: 1px solid ${({ theme }) => theme.palette.semantic.nodeAdd.previewBorder};
  border-radius: 12px;
  padding: 14px 16px 6px;
  background: ${({ theme }) => theme.palette.semantic.nodeAdd.previewBackground};
`

const PreviewTitle = styled(Text)`
  display: inline-flex;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  opacity: 0.78;
`

export const TextRow: React.FC<{ label: string; value?: string | number | React.ReactNode }> = ({
  label,
  value
}) => {
  return (
    <PreviewRow gap={6} align="center">
      <PreviewLabel>{label}:</PreviewLabel>
      <Text>{value}</Text>
    </PreviewRow>
  )
}

const PreviewRow = styled(Flex)`
  margin-bottom: 20px;
`

const PreviewLabel = styled(Text)`
  min-width: 170px;
  opacity: 0.78;
`

const ChoiceGroup = styled(Radio.Group)`
  width: 100%;
`

const ChoiceList = styled(Space)`
  width: 100%;
`

const ChoiceItem = styled(Radio)`
  width: 100%;
  margin-inline-end: 0;
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.palette.semantic.nodeAdd.choiceBorder};
  border-radius: 10px;
  background: ${({ theme }) => theme.palette.semantic.nodeAdd.choiceBackground};
`

const PortRow = styled(Flex)`
  margin-bottom: 12px;
  padding: 8px 10px;
  border: 1px solid ${({ theme }) => theme.palette.semantic.nodeAdd.portBorder};
  border-radius: 10px;
  background: ${({ theme }) => theme.palette.semantic.nodeAdd.portBackground};
`

const PortInputWrap = styled.div`
  min-width: 170px;
`

const StyledInput = styled(Input)`
  width: 100%;
  max-width: 360px;
`
const Label = styled(Text)`
  min-width: 190px;
  opacity: 0.86;
`
