# Architecture

## High-level flow

1. Electron app starts (`src/main/index.ts`).
2. Migrations run against `wf.db`.
3. Main services initialize:
   - `Node`
   - `Worker`
   - `FsHandle`
   - `Settings`
4. Background monitors start:
   - Status monitor worker thread
   - Snapshot monitor worker thread
5. Renderer UI communicates through preload IPC bridge.

## Process boundaries

- Main process (`src/main/*`):
  Owns stateful services, SQLite models, binary execution logic, tray/menu, auto-updater, and shutdown flow.
- Worker threads (`src/main/monitoring/*/worker.ts`):
  Perform periodic monitoring without blocking the main process.
- Preload (`src/preload/*`):
  Defines strict IPC wrappers for renderer access.
- Renderer (`src/renderer/src/*`):
  UI layer and client-side state/query logic.

## Core modules

- `Node` service (`src/main/node/index.ts`):
  Registers node IPC handlers, manages local/provider node instances, enforces deletion constraints, and reacts to snapshot-finish events.
- `Worker` service (`src/main/worker/index.ts`):
  Registers worker IPC handlers, creates/imports/removes workers, calculates action payloads, and sends signed transactions to RPC endpoints.
- `EventBus` (`src/main/libs/EventBus.ts`):
  Decouples snapshot monitor and node lifecycle interactions.
- `FsHandle` (`src/main/libs/FsHandle.ts`):
  Implements file/directory dialogs and external URL operations.

## Background monitoring

- Status monitoring (`src/main/monitoring/status`):
  Polls node sync/peer data and updates node/worker records.
- Snapshot monitoring (`src/main/monitoring/snapshot`):
  Drives snapshot download/verify/extract states and resumes node start when complete.

## Data and persistence

- Database engine: `better-sqlite3`
- DB path: `<electron userData>/wf.db`
- Models:
  - `NodeModel` (`src/main/models/node.ts`)
  - `WorkerModel` (`src/main/models/worker.ts`)
- Migration engine:
  - `migrate` with custom `SQLiteStore` state backend.

## UI architecture

- Routing: `react-router-dom` with hash routing
- Server state: `@tanstack/react-query`
- Styling: `styled-components` + custom `ui-kit` wrappers (built on top of Ant Design)
- Theme system:
  - `src/renderer/src/providers/AppThemeProvider.tsx` composes Styled Components theme + Ant Design `ConfigProvider`.
  - `src/renderer/src/ui-kit/theme/palette.ts` defines app-level light/dark palette used by styled components.
  - `src/renderer/src/ui-kit/theme/antd.ts` defines Ant Design light/dark tokens and component overrides.
- Motion system:
  - UI transitions are defined in shared UI components (`ui-kit` and page shell) and respect `prefers-reduced-motion`.
  - Visual behavior is theme-token driven, so component logic is shared between light and dark modes.
- IPC access: thin API wrappers in `src/renderer/src/api/*`
