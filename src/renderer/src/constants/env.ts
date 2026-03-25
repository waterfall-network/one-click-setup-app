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
const path = window.os.path

const ENV = import.meta.env

export const APP_TITLE = ENV.VITE_APP_TITLE

export const DEFAULT_WF_PATH = path.resolve(path.join(window.os.homedir, ENV.VITE_DATA_PATH))

export const COORDINATOR_HTTP_API_PORT = ENV.VITE_COORDINATOR_HTTP_API_PORT
export const COORDINATOR_HTTP_VALIDATOR_API_PORT = ENV.VITE_COORDINATOR_HTTP_VALIDATOR_API_PORT
export const COORDINATOR_P2P_TCP_PORT = ENV.VITE_COORDINATOR_P2P_TCP_PORT
export const COORDINATOR_P2P_UDP_PORT = ENV.VITE_COORDINATOR_P2P_UDP_PORT
export const VALIDATOR_P2P_PORT = ENV.VITE_VALIDATOR_P2P_PORT
export const VALIDATOR_HTTP_API_PORT = ENV.VITE_VALIDATOR_HTTP_API_PORT
export const VALIDATOR_WS_API_PORT = ENV.VITE_VALIDATOR_WS_API_PORT

export const LAST_SNAPSHOT_URL = ENV.VITE_LAST_SNAPSHOT_URL
