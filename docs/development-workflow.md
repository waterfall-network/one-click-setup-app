# Development Workflow

## Primary scripts

From `package.json`:

- `npm run dev`: run Electron + renderer in development mode.
- `npm run dev:watch`: dev mode with watch behavior.
- `npm run start`: preview built app.
- `npm run build`: typecheck + production build.
- `npm run build:win`: build and package for Windows.
- `npm run build:mac`: build and package for macOS.
- `npm run build:linux`: build and package for Linux.
- `npm run lint`: run ESLint with auto-fix.
- `npm run format`: run Prettier.
- `npm run typecheck`: node + web TypeScript checks.

## Linting and formatting

- ESLint config: `eslint.config.mjs`
- Prettier config: `.prettierrc.yaml`
- Recommended editor setup is documented in root `README.md`.
- Team conventions: `docs/code-style.md`

## TypeScript targets

- `tsconfig.node.json`: main/preload related typecheck scope.
- `tsconfig.web.json`: renderer typecheck scope.

## Database migration rules

Follow `docs/migration-guidelines.md` for naming, registration, rollback policy, and verification checklist.

## Security requirements

For changes touching IPC, secrets, file access, or external URLs, follow `docs/security.md`.

## Task tracking (Beads)

Use `bd` as the project task tracker:

1. Pick/create issue.
2. Set `in_progress` before implementation.
3. Link discovered work via `discovered-from` dependency.
4. Close issue after code, checks, and docs updates.
5. Run `bd sync` before push.

## Local development cycle

1. Install dependencies and binaries.
2. Configure `.env`.
3. Start `npm run dev`.
4. Validate flows:
   - node add/start/stop
   - worker add/import/remove
   - status/snapshot updates
5. Run `npm run typecheck` and `npm run lint` before packaging.
6. Before opening PR, go through `docs/pr-checklist.md`.

## Current test posture

No dedicated automated test suite is wired in `package.json` at this time.
Validation is primarily manual/integration-driven through the desktop flows.
