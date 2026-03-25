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
const root_routes = {
  nodes: 'nodes',
  workers: 'workers',
  statistics: 'statistics',
  settings: 'settings',
  changelog: 'changelog',
  notifications: 'notifications'
}

const sub_routes = {
  nodes: {
    list: `/${root_routes.nodes}/list`,
    view: `/${root_routes.nodes}/view/:id`,
    create: `/${root_routes.nodes}/create`
  },
  workers: {
    list: `/${root_routes.workers}/list`,
    view: `/${root_routes.workers}/view/:id`,
    add: `/${root_routes.workers}/add`,
    import: `/${root_routes.workers}/import`
  },
  statistics: {
    view: `/${root_routes.statistics}/view`
  },
  settings: `/settings`,
  changelog: `/changelog`,
  notifications: `/notifications`
}

const SearchKeys = {
  node: 'node',
  step: 'step',
  mode: 'mode',
  type: 'type',
  network: 'network'
}

export { sub_routes as routes, root_routes, SearchKeys }
