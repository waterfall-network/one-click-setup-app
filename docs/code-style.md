# Code Style

This document defines practical code style rules for this repository.

## Source of truth

- Formatting: `.editorconfig` + `.prettierrc.yaml`
- Linting: `eslint.config.mjs`
- Type checks: `tsconfig.node.json`, `tsconfig.web.json`

When this document and tooling disagree, tooling wins.

## Formatting rules

- Charset: UTF-8
- Indentation: 2 spaces
- Line endings: LF
- Final newline: required
- Trailing whitespace: trimmed
- Quotes: single quotes
- Semicolons: omitted
- Max line length: 100
- Trailing commas: none

Run:

- `npm run format`
- `npm run lint`

## TypeScript and React conventions

- Use TypeScript for all new app logic.
- Keep strict, explicit domain types in `src/main/models/*` and `src/renderer/src/types/*`.
- `any` is allowed by lint config, but prefer concrete types unless dynamic data parsing requires otherwise.
- Unused function arguments should be prefixed with `_` when intentional.
- In React:
  - Use function components.
  - Keep route/page composition in `containers/` and `pages/`.
  - Keep reusable UI pieces in `components/` or `ui-kit/`.

## Naming and file organization

- Follow existing naming patterns:
  - `PascalCase` for React components and class-like modules.
  - `camelCase` for functions/variables.
  - `UPPER_SNAKE_CASE` for constants/enums where already used.
- Keep domain APIs thin:
  - Renderer API wrappers in `src/renderer/src/api/*`.
  - IPC handlers in main services (`src/main/node`, `src/main/worker`, `src/main/libs/FsHandle.ts`).
- IPC channel names should stay namespaced:
  - `<domain>:<action>`, e.g. `node:start`, `worker:getAll`, `os:selectFile`.

## Database and migration style

- For schema changes, follow `docs/migration-guidelines.md`.
- Keep migration SQL deterministic and additive where possible.
- Keep `updatedAt` maintenance via triggers.

## Logging and errors

- Use `electron-log` in main process code for operational events and failures.
- Return structured status objects from IPC handlers instead of throwing unhandled runtime errors to renderer.
