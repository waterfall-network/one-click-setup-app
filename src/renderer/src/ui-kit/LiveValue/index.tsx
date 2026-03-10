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
import { keyframes, styled } from 'styled-components'

type LiveValueProps = {
  value: string | number
  children: React.ReactNode
}

export const LiveValue: React.FC<LiveValueProps> = ({ value, children }) => {
  const [animate, setAnimate] = React.useState(false)
  const prevValueRef = React.useRef<string | number | null>(null)

  React.useEffect(() => {
    if (prevValueRef.current === null) {
      prevValueRef.current = value
      return
    }

    if (prevValueRef.current !== value) {
      setAnimate(true)
      const timeout = setTimeout(() => setAnimate(false), 420)
      prevValueRef.current = value
      return () => clearTimeout(timeout)
    }

    return undefined
  }, [value])

  return <ValueWrap $animate={animate}>{children}</ValueWrap>
}

const valuePulse = keyframes`
  0% {
    opacity: 1;
    transform: scale(1);
  }
  30% {
    opacity: 0.7;
    transform: scale(1.02);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`

const ValueWrap = styled.span<{ $animate: boolean }>`
  display: inline-flex;
  align-items: center;
  border-radius: 8px;
  padding: 1px 6px;
  margin: -1px -6px;
  animation: ${({ $animate }) => ($animate ? valuePulse : 'none')} 420ms ease-out;
  transform-origin: center;

  @media (prefers-reduced-motion: reduce) {
    animation: none !important;
  }
`
