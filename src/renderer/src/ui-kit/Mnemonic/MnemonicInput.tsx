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
import React, { useRef } from 'react'
import { styled } from 'styled-components'
import { Input } from '@renderer/ui-kit/Input'

type GenerateMnemonicPropsT = {
  value: Record<number, string>
  onChange: (value: Record<number, string>) => void
}

const inputs = Array.from(Array(24).keys())

export const MnemonicInput: React.FC<GenerateMnemonicPropsT> = ({ value, onChange }) => {
  const rootRef = useRef<HTMLDivElement>(null)

  const focusByIndex = (index: number) => {
    const input = rootRef.current?.querySelector<HTMLInputElement>(`input[name='input-${index}']`)
    input?.focus()
  }

  const handleChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value
    if (nextValue.includes(' ')) {
      const words = nextValue.split(' ').slice(0, 24 - index)
      const nextValues = {}
      words?.forEach((el, i) => (nextValues[index + i] = el))
      onChange({ ...value, ...nextValues })
      focusByIndex(index + words.length - 1)
      return
    }
    onChange({ ...value, [index]: nextValue })
  }

  return (
    <Wrapper ref={rootRef}>
      {inputs.map((el, i) => (
        <Item key={el}>
          <Num>{i + 1}</Num>
          <PhraseInput value={value[i]} autoFocus onChange={handleChange(i)} name={`input-${i}`} />
        </Item>
      ))}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  row-gap: 20px;
`

const Item = styled.div`
  width: 20%;
  margin: 0px 2px;
  position: relative;
`

const Num = styled.div`
  position: absolute;
  left: -12px;
  bottom: -6px;
  font-size: 9px;
`

const PhraseInput = styled(Input)`
  width: 90%;
  text-align: center;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.palette.semantic.mnemonic.inputBorder};
  border-radius: 0;
  outline: none;
  box-shadow: unset !important;
`
