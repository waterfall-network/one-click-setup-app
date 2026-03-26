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
export interface ValidatorInfo {
  activationEra: number
  address: string
  exitEra: number
  index: number
  pubKey: string
  withdrawalAddress: string
}
export function isValidatorInfo(value: any): value is ValidatorInfo {
  return (
    value &&
    typeof value === 'object' &&
    'activationEra' in value &&
    'address' in value &&
    'exitEra' in value &&
    'index' in value &&
    'pubKey' in value &&
    'withdrawalAddress' in value
  )
}

export interface EraInfo {
  fromEpoch: number
  number: number
  root: string
  toEpoch: number
}

export function isEraInfo(value: any): value is EraInfo {
  return (
    value &&
    typeof value === 'object' &&
    'fromEpoch' in value &&
    'number' in value &&
    'root' in value &&
    'toEpoch' in value
  )
}

interface Rules {
  profit_share: {
    [key: string]: number
  }
  stake_share: {
    [key: string]: number
  }
  exit: string[]
  withdrawal: string[]
}
export interface DelegateRules {
  trial_period?: number
  trial_rules?: Rules
  rules?: Rules
}

function validateRules(rules: any): rules is Rules {
  if (typeof rules !== 'object' || rules === null) return false
  if (!validateProfitShareOrStakeShare(rules.profit_share)) return false
  if (!validateProfitShareOrStakeShare(rules.stake_share)) return false
  if (!Array.isArray(rules.exit) || !rules.exit.every((item) => typeof item === 'string'))
    return false
  if (
    !Array.isArray(rules.withdrawal) ||
    !rules.withdrawal.every((item) => typeof item === 'string')
  )
    return false
  return true
}
function validateProfitShareOrStakeShare(share: any): boolean {
  if (typeof share !== 'object' || share === null) return false
  for (const key in share) {
    if (typeof share[key] !== 'number') return false
  }
  return true
}
export function validateDelegateRules(json: any): json is DelegateRules {
  if (typeof json !== 'object' || json === null) return false
  if (json.trial_period !== undefined && typeof json.trial_period !== 'number') return false
  if (json.trial_rules !== undefined && !validateRules(json.trial_rules)) return false
  if (json.rules !== undefined && !validateRules(json.rules)) return false
  return true
}

interface Deposit {
  pubkey: string
  creator_address: string
  withdrawal_address: string
  amount: number
  signature: string
  deposit_message_root: string
  deposit_data_root: string
  fork_version: string
  eth2_network_name: string
  deposit_cli_version: string
}

function validateDeposit(deposit: any): deposit is Deposit {
  if (typeof deposit !== 'object' || deposit === null) return false
  if (typeof deposit.pubkey !== 'string') return false
  if (typeof deposit.creator_address !== 'string') return false
  if (typeof deposit.withdrawal_address !== 'string') return false
  if (typeof deposit.amount !== 'number') return false
  if (typeof deposit.signature !== 'string') return false
  return true
}
export function validateDepositData(deposits: any): deposits is Deposit[] {
  if (!Array.isArray(deposits)) return false
  return deposits.every((deposit) => validateDeposit(deposit))
}
