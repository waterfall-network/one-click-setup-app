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
import { DataPointsBalance, DataPointsStatus } from '@renderer/types/data'

export const useGetWorkerEarningData = () => {
  const data = {
    maxIncome: [
      { y: 10, x: 100, toolTipContent: '10.5' },
      { y: 12, x: 200, toolTipContent: '12.5' },
      { y: 14, x: 300, toolTipContent: '14' },
      { y: 12, x: 400, toolTipContent: '12.5' },
      { y: 14, x: 500, toolTipContent: '14' },
      { y: 12, x: 600, toolTipContent: '12.5' },
      { y: 10, x: 700, toolTipContent: '10.5' },
      { y: 12, x: 800, toolTipContent: '12.5' },
      { y: 15, x: 900, toolTipContent: '15' }
    ],
    minIncome: [
      { y: -1, x: 100, toolTipContent: '0.5' },
      { y: -2, x: 200, toolTipContent: '-1' },
      { y: 2, x: 300, toolTipContent: '2' },
      { y: 3, x: 400, toolTipContent: '3' },
      { y: 2, x: 500, toolTipContent: '2' },
      { y: 3, x: 600, toolTipContent: '3' },
      { y: -1, x: 700, toolTipContent: '0.5' },
      { y: 2, x: 800, toolTipContent: '2' }
    ],
    averageIncome: [
      { y: 6, x: 100, toolTipContent: '6.4' },
      { y: 7, x: 200, toolTipContent: '7.1' },
      { y: 5, x: 300, toolTipContent: '5.8' },
      { y: 6, x: 400, toolTipContent: '6.4' },
      { y: 6, x: 500, toolTipContent: '6.4' },
      { y: 5, x: 600, toolTipContent: '5.8' },
      { y: 6, x: 700, toolTipContent: '6.4' },
      { y: 7, x: 800, toolTipContent: '7.1' },
      { y: 8, x: 900, toolTipContent: '8.1' }
    ]
  }
  return { data }
}

export const useGetWorkerStatusData = () => {
  const data: DataPointsStatus = {
    pending_activation: [
      { y: 5, x: 100, toolTipContent: '5.5' },
      { y: 7, x: 200, toolTipContent: '7.5' },
      { y: 4, x: 300, toolTipContent: '4' },
      { y: 7, x: 400, toolTipContent: '7.5' },
      { y: 4, x: 500, toolTipContent: '4' },
      { y: 7, x: 600, toolTipContent: '7.5' },
      { y: 5, x: 700, toolTipContent: '5.5' },
      { y: 7, x: 800, toolTipContent: '7.5' },
      { y: 5, x: 900, toolTipContent: '5' }
    ],
    inactive: [
      { y: -1, x: 100, toolTipContent: '0.5' },
      { y: -2, x: 200, toolTipContent: '-1' },
      { y: 2, x: 300, toolTipContent: '2' },
      { y: 3, x: 400, toolTipContent: '3' },
      { y: 2, x: 500, toolTipContent: '2' },
      { y: 3, x: 600, toolTipContent: '3' },
      { y: -1, x: 700, toolTipContent: '0.5' },
      { y: 2, x: 800, toolTipContent: '2' }
    ],
    active: [
      { y: 6, x: 100, toolTipContent: '6.4' },
      { y: 7, x: 200, toolTipContent: '7.1' },
      { y: 5, x: 300, toolTipContent: '5.8' },
      { y: 6, x: 400, toolTipContent: '6.4' },
      { y: 6, x: 500, toolTipContent: '6.4' },
      { y: 5, x: 600, toolTipContent: '5.8' },
      { y: 6, x: 700, toolTipContent: '6.4' },
      { y: 7, x: 800, toolTipContent: '7.1' },
      { y: 8, x: 900, toolTipContent: '8.1' }
    ],
    pending_deactivation: [
      { y: 0, x: 100, toolTipContent: '0.5' },
      { y: 2, x: 200, toolTipContent: '2.5' },
      { y: 4, x: 300, toolTipContent: '4' },
      { y: 2, x: 400, toolTipContent: '2.5' },
      { y: 4, x: 500, toolTipContent: '4' },
      { y: 2, x: 600, toolTipContent: '2.5' },
      { y: 0, x: 700, toolTipContent: '0.5' },
      { y: 2, x: 800, toolTipContent: '2.5' },
      { y: 5, x: 900, toolTipContent: '5' }
    ]
  }
  return { data }
}

export const useGetWorkerBalanceData = () => {
  const data: DataPointsBalance = {
    balance: [
      { y: 500, x: 100, toolTipContent: '500' },
      { y: 700, x: 200, toolTipContent: '700' },
      { y: 600, x: 300, toolTipContent: '600' },
      { y: 500, x: 400, toolTipContent: '500' },
      { y: 700, x: 500, toolTipContent: '700' },
      { y: 600, x: 600, toolTipContent: '600' },
      { y: 500, x: 700, toolTipContent: '500' },
      { y: 600, x: 800, toolTipContent: '600' }
    ],
    effective_balance: [
      { y: 400, x: 100, toolTipContent: '400' },
      { y: 430, x: 230, toolTipContent: '430' },
      { y: 450, x: 350, toolTipContent: '450' },
      { y: 480, x: 480, toolTipContent: '480' },
      { y: 430, x: 530, toolTipContent: '430' },
      { y: 520, x: 620, toolTipContent: '520' },
      { y: 450, x: 750, toolTipContent: '450' },
      { y: 400, x: 800, toolTipContent: '400' }
    ],
    income: [
      { y: 300, x: 100, toolTipContent: '300' },
      { y: 330, x: 230, toolTipContent: '330' },
      { y: 350, x: 350, toolTipContent: '350' },
      { y: 380, x: 480, toolTipContent: '380' },
      { y: 330, x: 530, toolTipContent: '330' },
      { y: 520, x: 620, toolTipContent: '520' },
      { y: 350, x: 750, toolTipContent: '350' },
      { y: 300, x: 800, toolTipContent: '300' }
    ],
    rewards: [
      { y: 700, x: 700, toolTipContent: '700' },
      { y: 770, x: 770, toolTipContent: '770' },
      { y: 750, x: 750, toolTipContent: '750' },
      { y: 780, x: 780, toolTipContent: '780' },
      { y: 770, x: 770, toolTipContent: '770' },
      { y: 820, x: 520, toolTipContent: '820' },
      { y: 750, x: 750, toolTipContent: '750' },
      { y: 700, x: 700, toolTipContent: '700' }
    ],
    penalty: [
      { y: 40, x: 40, toolTipContent: '40' },
      { y: 43, x: 43, toolTipContent: '43' },
      { y: 45, x: 45, toolTipContent: '45' },
      { y: 48, x: 48, toolTipContent: '48' },
      { y: 43, x: 43, toolTipContent: '43' },
      { y: 42, x: 42, toolTipContent: '42' },
      { y: 45, x: 45, toolTipContent: '45' },
      { y: 40, x: 40, toolTipContent: '40' }
    ]
  }
  return { data }
}

export const useGetWorkerRewardsData = () => {
  const data: DataPointsBalance = {
    balance: [
      { y: 500, x: 100, toolTipContent: '500' },
      { y: 700, x: 200, toolTipContent: '700' },
      { y: 600, x: 300, toolTipContent: '600' },
      { y: 500, x: 400, toolTipContent: '500' },
      { y: 700, x: 500, toolTipContent: '700' },
      { y: 600, x: 600, toolTipContent: '600' },
      { y: 500, x: 700, toolTipContent: '500' },
      { y: 600, x: 800, toolTipContent: '600' }
    ],
    effective_balance: [
      { y: 400, x: 100, toolTipContent: '400' },
      { y: 430, x: 230, toolTipContent: '430' },
      { y: 450, x: 350, toolTipContent: '450' },
      { y: 480, x: 480, toolTipContent: '480' },
      { y: 430, x: 530, toolTipContent: '430' },
      { y: 520, x: 620, toolTipContent: '520' },
      { y: 450, x: 750, toolTipContent: '450' },
      { y: 400, x: 800, toolTipContent: '400' }
    ],
    income: [
      { y: 300, x: 100, toolTipContent: '300' },
      { y: 330, x: 230, toolTipContent: '330' },
      { y: 350, x: 350, toolTipContent: '350' },
      { y: 380, x: 480, toolTipContent: '380' },
      { y: 330, x: 530, toolTipContent: '330' },
      { y: 520, x: 620, toolTipContent: '520' },
      { y: 350, x: 750, toolTipContent: '350' },
      { y: 300, x: 800, toolTipContent: '300' }
    ],
    rewards: [
      { y: 100, x: 100, toolTipContent: '100' },
      { y: 200, x: 200, toolTipContent: '200' },
      { y: 230, x: 330, toolTipContent: '230' },
      { y: 180, x: 480, toolTipContent: '180' },
      { y: 770, x: 570, toolTipContent: '770' },
      { y: 750, x: 650, toolTipContent: '750' },
      { y: 780, x: 780, toolTipContent: '780' },
      { y: 770, x: 870, toolTipContent: '770' },
      { y: 820, x: 920, toolTipContent: '820' },
      { y: 750, x: 1050, toolTipContent: '750' },
      { y: 700, x: 1100, toolTipContent: '700' },
      { y: 820, x: 1200, toolTipContent: '820' },
      { y: 1020, x: 1320, toolTipContent: '1020' }
    ],
    penalty: [
      { y: 40, x: 100, toolTipContent: '40' },
      { y: 43, x: 200, toolTipContent: '43' },
      { y: 45, x: 330, toolTipContent: '45' },
      { y: 48, x: 570, toolTipContent: '48' },
      { y: 43, x: 780, toolTipContent: '43' },
      { y: 42, x: 1050, toolTipContent: '42' },
      { y: 45, x: 1200, toolTipContent: '45' },
      { y: 40, x: 1200, toolTipContent: '40' }
    ]
  }
  return { data }
}
