# PR Checklist

Use this checklist before requesting review or merging.

## Quality gates

1. Code follows `docs/code-style.md`.
2. `npm run typecheck` passes.
3. `npm run lint` passes (or all intended fixes are applied).
4. If formatting changed, `npm run format` was run.

## Functional validation

5. Updated flows were tested manually in the app.
6. Edge/error paths were checked for the changed feature.
7. No obvious regressions in related screens or IPC flows.

## Data and migrations

8. If DB schema changed:
   - migration created and registered in `src/main/libs/migrate.ts`
   - rules from `docs/migration-guidelines.md` are followed
   - app tested on clean and existing DB

## Build and release impact

9. If packaging/update logic changed, relevant build command was verified (`build:win`, `build:mac`, or `build:linux`).
10. Any env/config changes are documented in `docs/configuration.md`.

## Documentation

11. Docs were updated for behavior/API/schema changes.
12. Commit message(s) clearly explain what changed and why.
