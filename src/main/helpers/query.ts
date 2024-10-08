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
export interface Condition<T> {
  operation: 'eq' | 'neq' | 'in'
  value: T | T[]
}

export function appendCondition<T>(
  property: string,
  condition: T | Condition<T>,
  conditions: string[],
  params: any[]
) {
  if (condition && typeof condition === 'object' && 'operation' in condition) {
    const { operation, value } = condition
    switch (operation) {
      case 'eq':
        conditions.push(`${property} = ?`)
        params.push(value)
        break
      case 'neq':
        conditions.push(`${property} != ?`)
        params.push(value)
        break
      case 'in':
        if (Array.isArray(value)) {
          conditions.push(`${property} IN (${value.map(() => '?').join(', ')})`)
          params.push(...value)
        }
        break
      default:
        throw new Error(`Unsupported operation: ${operation}`)
    }
  } else {
    conditions.push(`${property} = ?`)
    params.push(condition)
  }
}
