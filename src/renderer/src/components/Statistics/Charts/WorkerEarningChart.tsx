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
import React, { useMemo } from 'react'
import { ChartWrapper } from './styles'
import CanvasJSReact from '@canvasjs/react-stockcharts'
import { getEarningOptions } from '@renderer/helpers/charts'
import { DataPointsIncome } from '@renderer/types/data'
import { Title } from '@renderer/ui-kit/Typography'
import { Flex } from '@renderer/ui-kit/Flex'
import { StockOutlined } from '@ant-design/icons'

const CanvasJSStockChart = CanvasJSReact.CanvasJSStockChart

type PropsT = {
  data: DataPointsIncome
  loading?: boolean
}

export const WorkerEarningChart: React.FC<PropsT> = ({ data }) => {
  const options = useMemo(() => getEarningOptions(data), [data])
  const containerProps = {
    width: '100%',
    height: '400px',
    margin: 'auto'
  }
  return (
    <ChartWrapper>
      <Title level={5}>
        <Flex gap={10}>
          <StockOutlined />
          Consult the chart to calculate Validator earnings
        </Flex>
      </Title>
      <CanvasJSStockChart containerProps={containerProps} options={options} />
    </ChartWrapper>
  )
}
