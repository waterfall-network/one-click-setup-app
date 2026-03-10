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
import React, { useEffect, useRef, useState, useMemo } from 'react'
import { styled } from 'styled-components'
import { shuffleArray } from '../../helpers/common'
import { Input } from '@renderer/ui-kit/Input'

type VerifyMnemonicPropsT = {
  phrase: string[]
  value: Record<number, string>
  handleChange: (value: Record<number, string>) => void
}

export const VerifyMnemonic: React.FC<VerifyMnemonicPropsT> = ({ phrase, value, handleChange }) => {
  const rootRef = useRef<HTMLDivElement>(null)
  const [editableCells, setEditableCells] = useState<(number | null)[]>([])
  const [currentFocus, setCurrentFocus] = useState(Object.values(value).findIndex((el) => !el))

  const focusByIndex = (index: number) => {
    const input = rootRef.current?.querySelector<HTMLInputElement>(`input[name='input-${index}']`)
    input?.focus()
  }

  const onCardClick = (word: string) => () => {
    if (currentFocus === -1) return
    const nextValue = { ...value, [currentFocus]: word }
    const nextFocus = Object.values(nextValue).findIndex((el) => !el)
    setCurrentFocus(nextFocus)
    focusByIndex(nextFocus)
    handleChange(nextValue)
  }
  const onRemoveClick = (index: number) => () => {
    handleChange({ ...value, [index]: '' })
    setCurrentFocus(index)
    focusByIndex(index)
  }
  const onInputFocus = (index: number) => () => setCurrentFocus(index)

  useEffect(() => {
    focusByIndex(currentFocus)
    const editable: (number | null)[] = Object.values(value)
      .map((el, i) => (!el ? i : null))
      .filter((el) => el !== null)
    setEditableCells(editable)
  }, [])

  const showPhrase = useMemo(() => shuffleArray(phrase), [phrase])

  return (
    <>
      <Wrapper ref={rootRef}>
        {phrase.map((_, index) => (
          <Item key={index}>
            <Num>{index + 1}</Num>
            <PhraseInput
              value={value?.[index]}
              name={`input-${index}`}
              onFocus={onInputFocus(index)}
            />
            {value?.[index] && editableCells.includes(index) && (
              <Closable onClick={onRemoveClick(index)}>&times;</Closable>
            )}
          </Item>
        ))}
      </Wrapper>
      <DNDContainer>
        {showPhrase.map(({ value: word, index }) => (
          <DNDItem
            onClick={onCardClick(word)}
            $disabled={!!value?.[index]}
            key={`${word}_${index}`}
          >
            {word}
          </DNDItem>
        ))}
      </DNDContainer>
    </>
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

const Closable = styled.div`
  position: absolute;
  right: 14px;
  top: -4px;
  font-size: 16px;
  cursor: pointer;
  color: ${({ theme }) => theme.palette.text.blue};
`
const PhraseInput = styled(Input)`
  width: 90%;
  text-align: center;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.palette.semantic.mnemonic.inputBorder};
  border-radius: 0;
  outline: none;
  /* pointer-events: none; */
  box-shadow: unset !important;
`

const DNDContainer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding-top: 4px;
  margin-top: 40px;
  margin-bottom: 20px;
`

const DNDItem = styled.div<{ $disabled?: boolean }>`
  min-width: 96px;
  color: ${({ theme }) => theme.palette.semantic.button.ghostText};
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  text-align: center;
  cursor: pointer;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.palette.semantic.button.ghostBorder};
  padding: 6px 10px;
  background: transparent;
  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
  box-sizing: border-box;

  &:hover {
    background: ${({ theme }) => theme.palette.semantic.button.ghostHoverBackground};
    border-color: ${({ theme }) => theme.palette.semantic.button.ghostBorder};
    transform: translateY(-1px);
  }

  ${({ $disabled, theme }) =>
    $disabled
      ? `
    color: ${theme.palette.semantic.mnemonic.chipDisabledText};
    background: ${theme.palette.semantic.mnemonic.chipDisabledBackground};
    border-color: ${theme.palette.semantic.button.ghostBorder};
    pointer-events: none;
    transform: none;
  `
      : ''}
`
