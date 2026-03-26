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
/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_DATA_PATH: string
  readonly VITE_COORDINATOR_HTTP_API_PORT: string
  readonly VITE_COORDINATOR_HTTP_VALIDATOR_API_PORT: string
  readonly VITE_COORDINATOR_P2P_TCP_PORT: string
  readonly VITE_COORDINATOR_P2P_UDP_PORT: string
  readonly VITE_VALIDATOR_P2P_PORT: string
  readonly VITE_VALIDATOR_HTTP_API_PORT: string
  readonly VITE_VALIDATOR_WS_API_PORT: string
  readonly MAIN_VITE_COORDINATOR_BOOTNODE_TESTNET8: string
  readonly MAIN_VITE_VALIDATOR_BOOTNODE_TESTNET8: string
  readonly VITE_CHAIN_ID_TESTNET8: string
  readonly VITE_VALIDATOR_ADDRESS_TESTNET8: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
