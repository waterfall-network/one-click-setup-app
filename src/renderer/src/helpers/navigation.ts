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
export const getViewLink = (route: string, params?: Record<string, string>) => {
  let parsedRoute = route
  Object.keys(params || {}).forEach((key) => {
    if (!params?.[key]) return
    parsedRoute = parsedRoute.replace(`:${key}`, params?.[key])
  })
  return parsedRoute
}

export const addParams = (route: string, params?: Record<string, string>) => {
  let parsedRoute = route
  Object.keys(params || {}).forEach((key, index) => {
    if (!params?.[key]) return
    if (index === 0) return (parsedRoute += `?${key}=${params[key]}`)
    return (parsedRoute += `&${key}=${params[key]}`)
  })
  return parsedRoute
}
