# Data Model

Persistence is implemented with SQLite (`better-sqlite3`) in `wf.db`.

Runtime SQLite pragmas (set in `src/main/libs/db.ts`):

- `busy_timeout = 5000`
- `foreign_keys = ON`

## Migration strategy

- Migration runtime: `migrate`
- State store: custom `SQLiteStore` (`migrations` table)
- Entry point: `runMigrations()` in `src/main/libs/migrate.ts`

## Tables

### `nodes`

Created in migration `1708512084_create_nodes_table`.

Key columns:

- Identity: `id`, `name`, `network`, `type`, `locationDir`
- Process state:
  `coordinatorStatus`, `coordinatorValidatorStatus`, `validatorStatus`, related PIDs
- Sync and peers:
  `coordinatorPeersCount`, `coordinatorHeadSlot`, `coordinatorSyncDistance`,
  `validatorPeersCount`, `validatorHeadSlot`, `validatorSyncDistance`
- Ports:
  `coordinatorHttpApiPort`, `coordinatorHttpValidatorApiPort`, `coordinatorP2PTcpPort`,
  `coordinatorP2PUdpPort`, `validatorP2PPort`, `validatorHttpApiPort`, `validatorWsApiPort`
- Worker relation helpers: `workersCount`, `memoHash`
- Snapshot workflow:
  `downloadStatus`, `downloadUrl`, `downloadHash`, `downloadSize`, `downloadBytes`
- Timestamps: `createdAt`, `updatedAt`

### `workers`

Created in migration `1710350397_create_workers_table`.

Key columns:

- Identity: `id`, `nodeId`, `number`
- Coordinator fields:
  `coordinatorPublicKey`, `coordinatorStatus`, balances/epochs/creation counters
- Validator fields:
  `validatorAddress`, `validatorStatus`, balances/epochs/block count
- Security/material:
  `withdrawalAddress`, `signature`
- Staking metadata:
  `stakeAmount`, `delegate`, `validatorIndex`
- Timestamps: `createdAt`, `updatedAt`

Foreign key:

- `workers.nodeId -> nodes.id` (`ON DELETE SET NULL`, `ON UPDATE CASCADE`)

### `settings`

Created in migration `1771174763_create_settings_table`.

Key columns:

- Singleton identity: `id` with `CHECK (id = 1)`
- UI/runtime settings: `theme`, `autoStartApp`, `autoStartNodes`, `monitoringInterval`
- Timestamps: `createdAt`, `updatedAt`

Notes:

- `theme` is constrained to `light`, `dark`, `system`.
- Boolean values are stored as SQLite integers (`0/1`).

## Triggers

- `update_nodes_trigger`: updates `nodes.updatedAt` on row updates.
- `update_workers_trigger`: updates `workers.updatedAt` on row updates.
- `update_workers_number_trigger`: sets worker sequence number and increments `nodes.workersCount` on insert.
- `update_settings_trigger`: updates `settings.updatedAt` on row updates.

Note:

- `updatedAt` is maintained by triggers intentionally, because SQLite does not provide a native per-column auto-update timestamp mechanism equivalent to `ON UPDATE CURRENT_TIMESTAMP`.

## Important enums

Node-related:

- Node type: `local`, `remote`, `provider`
- Download status:
  `downloading`, `downloadingPause`, `verifying`, `verifyingPause`, `extracting`,
  `extractingPause`, `finish`

Worker-related:

- Coordinator status enum and validator status enum are stored as text and mapped in `WorkerModel`.
- UI-level computed status labels are derived in model logic:
  `Pending Initialized`, `Pending Activation`, `Active`, `Exiting`, `Exited`.

Settings-related:

- Theme mode: `light`, `dark`, `system`
