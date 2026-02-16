# Configuration

## Environment file

The project reads configuration from `.env` via `import.meta.env` in both main and renderer code.

## Required keys

### App and paths

- `VITE_APP_TITLE`: application title shown in UI context.
- `VITE_DATA_PATH`: default relative data directory used to build node storage paths.
- `VITE_LAST_SNAPSHOT_URL`: endpoint used by renderer to fetch latest snapshot metadata.

### Network bootnodes

- `MAIN_VITE_COORDINATOR_BOOTNODE_MAINNET`
- `MAIN_VITE_COORDINATOR_BOOTNODE_TESTNET8`
- `MAIN_VITE_COORDINATOR_BOOTNODE_TESTNET9`
- `MAIN_VITE_VALIDATOR_BOOTNODE_MAINNET`
- `MAIN_VITE_VALIDATOR_BOOTNODE_TESTNET8`
- `MAIN_VITE_VALIDATOR_BOOTNODE_TESTNET9`

### RPC endpoints

- `VITE_RPC_MAINNET`
- `VITE_RPC_MAINNET5`
- `VITE_RPC_TESTNET8`
- `VITE_RPC_TESTNET9`

Notes:

- Values may contain comma-separated RPC URLs.
- `getRPCs()` splits and trims the list.
- `getRPC()` uses the first entry as primary.

### Chain and contract constants

- `VITE_CHAIN_ID_TESTNET8`
- `VITE_VALIDATOR_ADDRESS_MAINNET`
- `VITE_VALIDATOR_ADDRESS_TESTNET8`
- `VITE_VALIDATOR_ADDRESS_TESTNET9`

### Port defaults

- `VITE_COORDINATOR_HTTP_API_PORT`
- `VITE_COORDINATOR_HTTP_VALIDATOR_API_PORT`
- `VITE_COORDINATOR_P2P_TCP_PORT`
- `VITE_COORDINATOR_P2P_UDP_PORT`
- `VITE_VALIDATOR_P2P_PORT`
- `VITE_VALIDATOR_HTTP_API_PORT`
- `VITE_VALIDATOR_WS_API_PORT`

## Build/release configuration files

- `electron.vite.config.ts`:
  bundling, preload input, renderer aliases, renderer entrypoints.
- `electron-builder.yml`:
  app metadata, packaging exclusions, extraFiles, targets, signing/notarization, publish settings.
- `dev-app-update.yml`:
  update config used in development/testing context.

## Data locations

- SQLite DB: `<electron userData>/wf.db`
- Packaged binaries: `<process.resourcesPath>/bin`
- Development binaries: `<appPath>/resources/bin/<platform>/<arch>`
- Genesis files: `<process.resourcesPath>/genesis` (packaged) or `<appPath>/resources/genesis` (dev)

## Runtime settings (DB-backed)

- `monitoringInterval` (ms, 5000-60000):
  controls main-process status monitor frequency and renderer polling frequency for nodes/validators
  pages (`Nodes`, `Node View`, `Validators`, `Validator View`, validators statistics/filters).
