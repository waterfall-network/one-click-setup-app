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
import { styled } from 'styled-components'
import { Select } from '@renderer/ui-kit/Select'

type PropsT = {
  options: { label?: string; value?: string }[]
  value?: string[]
  onChange?: (value?: string[]) => void
}

export const NodeSelector: React.FC<PropsT> = ({ options, value, onChange }) => {
  return (
    <SelectWrapper>
      <Select options={options} value={value} onChange={onChange} mode="multiple" />
    </SelectWrapper>
  )
}

const SelectWrapper = styled.div`
  .ant-select-selector {
    max-width: 200px;
    max-height: 40px;
    overflow-y: auto;
  }
`
