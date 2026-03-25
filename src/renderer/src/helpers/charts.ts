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
import { DataPointsBalance, DataPointsIncome, DataPointsStatus } from '@renderer/types/data'
import { theme } from '@renderer/ui-kit/theme'

const range_era = 32
const range_days = 675
const range_week = range_days * 7
const range_month = range_days * 30
const range_year = range_days * 365

const getButtons = (lg: number) => {
  const buttons: any = [
    {
      label: 'Epoch',
      range: range_era,
      rangeType: 'number'
    }
  ]
  if (lg >= range_days) buttons.push({ label: 'Day', range: range_days, rangeType: 'number' })
  if (lg >= range_week) buttons.push({ label: 'Week', range: range_week, rangeType: 'number' })
  if (lg >= range_month) buttons.push({ label: 'Month', range: range_month, rangeType: 'number' })
  if (lg >= range_year) buttons.push({ label: 'Year', range: range_year, rangeType: 'number' })
  buttons.push({
    label: 'All',
    rangeType: 'all'
  })
  return buttons
}

const getNavigation = (buttons: any, data: any) => {
  return {
    rangeSelector: {
      height: 60,
      buttonStyle: {
        backgroundColor: 'transparent',
        borderColor: '#3576a8',
        labelFontWeight: 'normal',
        borderColorOnFocus: theme.palette.background.blue,
        backgroundColorOnSelect: '#1A3576a8',
        backgroundColorOnHover: 'transparent'
      },
      inputFields: {
        valueFormatString: '#',
        style: {
          fontSize: 16,
          width: 180,
          labelFontWeight: 'normal',
          backgroundColor: '#3576a8',
          borderColor: '#3576a8',
          borderColorOnFocus: theme.palette.background.blue
        }
      },
      buttons: buttons
    },
    navigator: {
      axisX: {
        labelFontColor: 'transparent'
      },
      height: 60,
      labelFontSize: 16,
      slider: {
        handleHeight: 60,
        handleBorderColor: theme.palette.text.blue,
        outlineColor: theme.palette.text.blue,
        handleBorderThickness: 3,
        handleColor: '#8dc7fc',
        maskColor: '#3e7fad'
      },
      data: data
      //backgroundColor: '#fff',
    }
  }
}

export const getEarningOptions = (dataPoints: DataPointsIncome) => {
  const lg = dataPoints?.maxIncome?.length
  if (!lg) return
  const buttons = getButtons(lg)
  const dataMax = {
    name: `Maximum`,
    type: 'spline',
    yValueFormatString: '#,###.##',
    showInLegend: true,
    xValueFormatString: '',
    dataPoints: dataPoints?.maxIncome
  }
  const dataMin = {
    name: `Minimum`,
    type: 'spline',
    yValueFormatString: '#,###.##',
    showInLegend: true,
    xValueFormatString: '',
    dataPoints: dataPoints?.minIncome
  }
  const dataAverage = {
    name: `Average`,
    type: 'spline',
    yValueFormatString: '#,###.##',
    showInLegend: true,
    xValueFormatString: '',
    dataPoints: dataPoints?.averageIncome
  }
  const data = [
    { ...dataMax, showInLegend: false },
    { ...dataMin, showInLegend: false },
    { ...dataAverage, showInLegend: false }
    //{...dataApr, showInLegend: false},
  ]
  /*const dataApr = {
      name: `Epoch APR ${W_SYMBOL}`,
      type: 'spline',
      yValueFormatString: '#,###.##',
      showInLegend: true,
      xValueFormatString: '',
      dataPoints: dataPoints?.epochApr,
    };*/
  return {
    animationEnabled: true,
    backgroundColor: 'transparent',
    theme: 'dark1',
    charts: [
      {
        axisX: {
          labelFormatter: function (e: any) {
            return Number(e.value) % 1 == 0 ? `${Number(e.value)?.toFixed(0)}` : ''
          },
          crosshair: {
            enabled: true,
            snapToDataPoint: true,
            valueFormatString: '#,###.##'
          },
          margin: 24
        },
        axisY: {
          title: 'WATER',
          titleFontSize: 16,
          crosshair: {
            enabled: true,
            snapToDataPoint: true,
            valueFormatString: `#,###.##`
          }
        },
        toolTip: {
          shared: true
        },
        data: [dataMax, dataMin, dataAverage]
      }
    ],
    ...getNavigation(buttons, data)
  }
}

export const validatorStatusLabels = {
  active: 'Active',
  pending_activation: 'Pending Activation',
  pending_deactivation: 'Pending Deactivation',
  inactive: 'Inactive'
}

export const getValidatorOptions = (dataPoints: DataPointsStatus) => {
  const lg = dataPoints?.active?.length
  if (!lg) return
  const buttons = getButtons(lg)
  const active = {
    name: `${validatorStatusLabels?.active}`,
    type: 'spline',
    showInLegend: true,
    xValueFormatString: '',
    dataPoints: dataPoints?.active
  }
  const inactive = {
    name: `${validatorStatusLabels?.inactive}`,
    type: 'spline',
    showInLegend: true,
    xValueFormatString: '',
    dataPoints: dataPoints?.inactive
  }
  const pending_activation = {
    name: `${validatorStatusLabels?.pending_activation}`,
    type: 'spline',
    showInLegend: true,
    xValueFormatString: '',
    dataPoints: dataPoints?.pending_activation
  }
  const pending_deactivation = {
    name: `${validatorStatusLabels?.pending_deactivation}`,
    type: 'spline',
    showInLegend: true,
    xValueFormatString: '',
    dataPoints: dataPoints?.pending_deactivation
  }
  const data = [
    { ...active, showInLegend: false },
    { ...inactive, showInLegend: false },
    { ...pending_activation, showInLegend: false },
    { ...pending_deactivation, showInLegend: false }
  ]
  return {
    animationEnabled: true,
    backgroundColor: 'transparent',
    theme: 'dark1',
    charts: [
      {
        axisX: {
          labelFormatter: function (e: any) {
            return Number(e.value) % 1 == 0 ? `${Number(e.value)?.toFixed(0)}` : ''
          },
          crosshair: {
            enabled: true,
            snapToDataPoint: true
          },
          margin: 24
        },
        axisY: {
          title: 'Count',
          titleFontSize: 16,
          crosshair: {
            enabled: true
            //snapToDataPoint: true
          }
        },
        toolTip: {
          shared: true
        },
        data: [active, inactive, pending_activation, pending_deactivation]
      }
    ],
    ...getNavigation(buttons, data)
  }
}

const getTopThree = (
  info: Array<{
    value: { y: number; x: number; toolTipContent: string }[]
    name: keyof DataPointsBalance
  }>
) => {
  const sorted = info.sort(
    (a, b) => b.value[b.value.length - 1]?.y - a.value[a.value.length - 1]?.y
  )
  const colorByIndex: string[] = ['#93a835E6', '#c2363b', '#3576a8E6']
  const result: Partial<Record<keyof DataPointsBalance, string>> = {}
  sorted.forEach((item, index) => Object.assign(result, { [item.name]: colorByIndex[index] || '' }))
  return result
}

export const getBalanceOptions = (dataPoints: DataPointsBalance) => {
  const lg = dataPoints?.income?.length
  if (!lg) return
  const colors = getTopThree([
    { name: 'income', value: dataPoints?.income },
    { name: 'effective_balance', value: dataPoints?.effective_balance },
    { name: 'balance', value: dataPoints?.balance }
  ])
  const buttons = getButtons(lg)
  const income = {
    name: 'Income',
    type: 'splineArea',
    showInLegend: true,
    color: colors['income'],
    xValueFormatString: '',
    dataPoints: dataPoints?.income
  }
  const effective_balance = {
    name: 'Stake',
    type: 'splineArea',
    color: colors['effective_balance'],
    showInLegend: true,
    xValueFormatString: '',
    dataPoints: dataPoints?.effective_balance
  }
  const balance = {
    name: 'Balance',
    type: 'splineArea',
    color: colors['balance'],
    showInLegend: true,
    xValueFormatString: '',
    dataPoints: dataPoints?.balance
  }
  const data = [
    { ...balance, showInLegend: false },
    { ...income, showInLegend: false },
    { ...effective_balance, showInLegend: false }
  ]
  return {
    animationEnabled: true,
    backgroundColor: 'transparent',
    theme: 'dark1',
    charts: [
      {
        axisX: {
          labelFormatter: function (e: any) {
            return Number(e.value) % 1 == 0 ? `${Number(e.value)?.toFixed(0)}` : ''
          },
          crosshair: {
            enabled: true,
            snapToDataPoint: true
          },
          margin: 24
        },
        axisY: {
          title: 'WATER',
          titleFontSize: 16,
          crosshair: {
            enabled: true
            //snapToDataPoint: true
          },
          valueFormatString: `#,###.##`,
          lineThickness: 0
        },
        toolTip: {
          shared: true,
          content: '{y}'
        },
        data: [balance, income, effective_balance].sort(
          (a, b) =>
            b.dataPoints[b.dataPoints.length - 1]?.y - a.dataPoints[a.dataPoints.length - 1]?.y
        )
      }
    ],
    ...getNavigation(buttons, data)
  }
}

export const getRewardsOptions = (dataPoints: DataPointsBalance) => {
  const lg = dataPoints?.rewards?.length
  if (!lg) return
  const buttons = getButtons(lg)
  const dataRewards = {
    name: `Rewards`,
    type: 'spline',
    yValueFormatString: '#,###.##',
    showInLegend: true,
    xValueFormatString: '',
    dataPoints: dataPoints?.rewards
  }
  const dataPenalty = {
    name: `Penalty`,
    type: 'spline',
    yValueFormatString: '#,###.##',
    showInLegend: true,
    xValueFormatString: '',
    dataPoints: dataPoints?.penalty
  }
  const data = [
    { ...dataRewards, showInLegend: false },
    { ...dataPenalty, showInLegend: false }
  ]
  return {
    animationEnabled: true,
    backgroundColor: 'transparent',
    theme: 'dark1',
    charts: [
      {
        axisX: {
          labelFormatter: function (e: any) {
            return Number(e.value) % 1 == 0 ? `${Number(e.value)?.toFixed(0)}` : ''
          },
          crosshair: {
            enabled: true,
            snapToDataPoint: true,
            valueFormatString: '#,###.##'
          }
        },
        axisY: {
          title: 'WATER',
          titleFontSize: 16,
          crosshair: {
            enabled: true,
            snapToDataPoint: true,
            valueFormatString: `#,###.##`
          },
          margin: 24
        },
        toolTip: {
          shared: true
        },
        data: [dataRewards, dataPenalty]
      }
    ],
    ...getNavigation(buttons, data)
  }
}
