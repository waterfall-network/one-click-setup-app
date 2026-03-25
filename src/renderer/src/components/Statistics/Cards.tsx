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
import { Col, Row } from '@renderer/ui-kit/Grid'
import { Flex } from '@renderer/ui-kit/Flex'
import { Card } from '@renderer/ui-kit/Card'
import React from 'react'

type PropsT = {
  cards: { title: string | React.ReactNode; content?: string | React.ReactNode }[]
}

export const StatisticsCards: React.FC<PropsT> = ({ cards, ...props }) => {
  return (
    <Row gutter={16} {...props}>
      {cards?.map((el, i) => (
        <Col span={8} key={i}>
          <Card title={<Flex justify="center">{el.title}</Flex>} type="inner">
            <Flex justify="center">{el.content}</Flex>
          </Card>
        </Col>
      ))}
    </Row>
  )
}
