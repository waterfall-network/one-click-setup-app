# Getting Started

## Prerequisites

- Node.js and npm
- macOS, Windows, or Linux (Electron target platforms)
- Required Waterfall binaries for your OS/arch in `resources/bin/...`

## Install dependencies

```bash
npm install
```

## Provide runtime binaries

Download the required coordinator/validator/verifier binaries and place them by platform:

- `resources/bin/mac/arm64`
- `resources/bin/mac/x64`
- `resources/bin/win/x64`

The upstream URLs are listed in the repository `README.md`.

## Configure environment

Create/update `.env` in the project root with the required keys documented in `docs/configuration.md`.

## Run in development

```bash
npm run dev
```

This starts the Electron app with Vite-powered renderer development mode.

## Build

```bash
npm run build
```

Platform-specific packaging:

```bash
npm run build:win
npm run build:mac
npm run build:linux
```

## First run behavior

On app startup the main process:

1. Runs SQLite migrations.
2. Initializes settings/node/worker/fs IPC handlers.
3. Starts status and snapshot monitoring workers.
4. Opens update window first and shows startup progress (`completed/total` steps + current step details).
5. If a startup step fails, keeps the update window open and shows which step failed and the error message.
6. Opens main UI window after all startup steps complete.
