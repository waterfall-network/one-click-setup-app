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
export type DataPointsIncome = {
  maxIncome: { y: number; x: number; toolTipContent: string }[]
  minIncome: { y: number; x: number; toolTipContent: string }[]
  averageIncome: { y: number; x: number; toolTipContent: string }[]
  //epochApr: {y: number; x: number; toolTipContent: string}[];
}

export type DataPointsStatus = {
  pending_activation: { y: number; x: number; toolTipContent: string }[]
  inactive: { y: number; x: number; toolTipContent: string }[]
  active: { y: number; x: number; toolTipContent: string }[]
  pending_deactivation: { y: number; x: number; toolTipContent: string }[]
}

export type DataPointsBalance = {
  balance: { y: number; x: number; toolTipContent: string }[]
  effective_balance: { y: number; x: number; toolTipContent: string }[]
  income: { y: number; x: number; toolTipContent: string }[]
  rewards: { y: number; x: number; toolTipContent: string }[]
  penalty: { y: number; x: number; toolTipContent: string }[]
}
