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
import React, { PropsWithChildren } from 'react'
import { Spin } from 'antd'
import { styled } from 'styled-components'

type PageBodyType = PropsWithChildren & {
  isLoading?: boolean
}
export const PageBody: React.FC<PageBodyType> = ({ isLoading, children }) => {
  if (isLoading) {
    return (
      <StyledWrapper>
        <Spin spinning tip="Loading" size="large">
          <LoadingState />
        </Spin>
      </StyledWrapper>
    )
  }

  return (
    <StyledWrapper>
      <Content>{children}</Content>
    </StyledWrapper>
  )
}

const StyledWrapper = styled.div`
  padding: 30px 40px 20px 40px;
  box-sizing: border-box;
  flex: 1;
  min-height: 0;
  overflow: auto;
`

const Content = styled.div`
  min-height: 240px;
`

const LoadingState = styled.div`
  min-height: 320px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`
