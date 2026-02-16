# Overview

## What this project is

Waterfall is an Electron desktop application for managing Waterfall network nodes and validator workers from a single UI.

The app combines:

- Node lifecycle management (start/stop/restart)
- Worker/validator management (create/import/remove)
- Snapshot download workflow for local nodes
- Status monitoring for nodes and workers
- Auto-update support for desktop distribution

## Main capabilities

- Manage multiple nodes (`local` and `provider` types)
- Configure and validate required network ports
- Track node sync/peer status in the background
- Add workers from mnemonic or deposit/delegate data files
- Build and send validator action transactions
- Persist state in a local SQLite database (`wf.db`)
- Switch application theme (`Light`, `Dark`, `System`) with shared design tokens
- Use consistent UI motion across headers, tabs, modals, tables, and loading/empty states

## Runtime model

- Main process:
  Owns process lifecycle, IPC handlers, tray behavior, migrations, monitors, and business services.
- Preload process:
  Exposes a safe bridge (`window.node`, `window.worker`, `window.os`, `window.app`) to the renderer.
- Renderer process:
  React application (HashRouter + React Query + styled-components + Ant Design theming) consuming preload APIs.

## Technology highlights

- Electron + electron-vite
- React 19 + TypeScript
- better-sqlite3
- web3 (custom Waterfall fork from GitLab)
- electron-builder + electron-updater
