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
import { styled } from 'styled-components'
import { Input } from '@renderer/ui-kit/Input'

type GenerateMnemonicPropsT = {
  phrase: string[]
}

export const GenerateMnemonic: React.FC<GenerateMnemonicPropsT> = ({ phrase }) => {
  return (
    <Wrapper>
      {phrase.map((el, i) => (
        <Item key={el}>
          <Num>{i + 1}</Num>
          <PhraseInput value={el} />
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
