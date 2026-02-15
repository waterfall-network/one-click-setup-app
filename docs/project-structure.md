# Project Structure

## Top-level layout

```text
.
├── build/                    # Packaging assets (icons, entitlements)
├── docs/                     # Project documentation
├── resources/                # Runtime resources (binaries, genesis, tray/app icons)
├── src/
│   ├── main/                 # Electron main process
│   ├── preload/              # Preload bridge
│   └── renderer/             # React renderer app
├── electron-builder.yml      # Packaging and publish config
├── electron.vite.config.ts   # Build config for main/preload/renderer
├── package.json              # Scripts + dependencies
└── tsconfig*.json            # TypeScript config split by target
```

## Main process (`src/main`)

- `index.ts`:
  App bootstrap, windows/tray, updater, lifecycle, graceful shutdown.
- `node/`:
  Node service and local/provider node implementations.
- `worker/`:
  Worker management and transaction actions.
- `monitoring/`:
  Worker-thread based status and snapshot monitoring.
- `models/`:
  SQLite data access for nodes and workers.
- `migrations/`:
  SQL schema migration files.
- `libs/`:
  Environment, DB, filesystem, web3, and utility abstractions.

## Preload (`src/preload`)

- `index.ts`: bridge setup via `contextBridge`.
- `node.ts`: renderer-accessible node IPC API.
- `worker.ts`: renderer-accessible worker IPC API.
- `index.d.ts`: renderer global typing (`window.node`, `window.worker`, etc.).

## Renderer (`src/renderer/src`)

- `api/`: wrapper functions over preload globals.
- `components/`: reusable UI components.
- `containers/`: route-level composition and feature containers.
- `pages/`: screen-level views.
- `hooks/`: UI and data hooks.
- `constants/`: routing, env and layout constants.
- `helpers/`: pure utility functions.
- `types/`: shared front-end types.
- `ui-kit/`: design system primitives and theme.
