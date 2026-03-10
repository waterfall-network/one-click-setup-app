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
import { styled } from 'styled-components'
import { Input } from '../Input'
import { ButtonPrimary } from '../Button'

type DataFilePropsT = {
  hideLabel?: boolean
  editable?: boolean
  errorMessage?: string
  value?: string
  handleChange: (val: string) => void
  placeholder?: string
  onSelectFile: () => void
}

export const DataFile: React.FC<DataFilePropsT> = ({
  errorMessage,
  value,
  handleChange,
  onSelectFile,
  placeholder
}) => {
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => handleChange(e.target.value)
  return (
    <Wrapper>
      <InputWrapper>
        <StyledInput placeholder={placeholder} value={value} onChange={onChange} />
        {<ButtonPrimary onClick={() => onSelectFile()}>Select</ButtonPrimary>}
      </InputWrapper>
      {errorMessage && <Error>{errorMessage}</Error>}
    </Wrapper>
  )
}

const StyledInput = styled(Input)`
  width: 100%;
  max-width: 360px;
`

const Wrapper = styled.div`
  max-width: 400px;
`

const Error = styled.div`
  font-size: 12px;
  margin-top: 4px;
  color: ${({ theme }) => theme.palette.text.red};
`
const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 360px;

  .ant-select {
    width: 100%;
  }

  & > .ant-btn {
    height: 32px;
  }
`
