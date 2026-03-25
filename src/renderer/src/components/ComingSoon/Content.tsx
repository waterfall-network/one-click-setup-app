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
import { Card } from '@renderer/ui-kit/Card'
import { Title, Text } from '@renderer/ui-kit/Typography'
import { styled } from 'styled-components'
import { LoadingOutlined } from '@ant-design/icons'

export const Content = () => {
  return (
    <Wrapper>
      <Panel>
        <Loading />
        <Title level={3}>Coming Soon</Title>
        <Description>
          This section is currently in development.
          <br />
          We are actively working on it and will ship it in a future release.
        </Description>
      </Panel>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 0 24px;
`

const Panel = styled(Card)`
  width: min(100%, 680px);
  text-align: center;
  padding: 22px 18px 18px;
`

const Loading = styled(LoadingOutlined)`
  font-size: 42px;
  color: ${({ theme }) => theme.palette.text.blue};
  margin-bottom: 8px;
`

const Description = styled(Text)`
  display: block;
  margin-top: 2px;
  font-size: 16px;
  line-height: 1.5;
  color: ${({ theme }) => theme.palette.text.gray};
`
