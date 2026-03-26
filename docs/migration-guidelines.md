# Migration Guidelines

This project uses the `migrate` package with a custom SQLite state store (`SQLiteStore`).

## Goals

- Keep schema evolution deterministic and auditable.
- Make startup migrations safe for existing users.
- Preserve backward compatibility of stored data.

## File naming and registration

1. Use timestamp-prefixed filenames:
   - `src/main/migrations/<unix_timestamp>_<short_description>.ts`
2. Export both functions:
   - `up(next: () => void): void`
   - `down(next: () => void): void`
3. Register every new migration in `src/main/libs/migrate.ts`:
   - import the file
   - add it to the `migrations` map

Without registration, migration will never execute.

## Writing `up` migrations

1. Prefer additive, forward-safe changes:
   - `ADD COLUMN`
   - new tables
   - new indexes
2. Always set sensible defaults for new `NOT NULL` columns.
3. Wrap multi-step schema updates in transaction blocks:
   - `BEGIN TRANSACTION; ... COMMIT;`
4. Keep migration logic minimal:
   - schema and small deterministic data fixes only
   - avoid network access and long-running operations

## Writing `down` migrations

1. Implement rollback where safe and realistic.
2. If rollback is unsafe for production data, keep `down` as no-op and document why in comments.
3. Ensure `down` still calls `next()`.

## SQLite-specific rules

1. Be careful with destructive operations:
   - avoid dropping columns/tables unless strictly required
2. Respect existing triggers:
   - if replacing a trigger, `DROP TRIGGER IF EXISTS ...` first
3. Keep trigger/table naming explicit and stable.
4. Do not rely on MySQL/Postgres-style auto-update timestamps.
   - SQLite has no native `ON UPDATE CURRENT_TIMESTAMP` behavior for arbitrary columns.
   - For `updatedAt`, always create/update an `AFTER UPDATE` trigger.
5. Prefer additive schema changes (`ALTER TABLE ... ADD COLUMN`) for existing production DBs.
   - SQLite supports limited `ALTER TABLE`; complex refactors usually require table recreation and data copy.
6. Store enums as `TEXT` and booleans as `INTEGER` (`0/1`) if needed.
   - Keep serialized values stable across releases.
7. Keep foreign keys compatible with runtime pragma.
   - The app enables `PRAGMA foreign_keys = ON`; invalid FK definitions will break writes.

## Timestamp pattern (required)

Use this pattern for tables with `updatedAt`:

1. Define default values on both timestamp columns:
   - `createdAt DATETIME NOT NULL DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW'))`
   - `updatedAt DATETIME NOT NULL DEFAULT (STRFTIME('%Y-%m-%d %H:%M:%f', 'NOW'))`
2. Add trigger:
   - `CREATE TRIGGER <table>_updated_at_trigger AFTER UPDATE ON <table> ...`
3. In `down`, drop the trigger before dropping/replacing table objects.

Current project examples:

- `update_nodes_trigger` in `src/main/migrations/1708512084_create_nodes_table.ts`
- `update_workers_trigger` in `src/main/migrations/1710350397_create_workers_table.ts`

## Data safety rules

1. Never remove user data implicitly in a migration.
2. If data transformation is needed:
   - make it idempotent
   - keep old values recoverable when possible
3. Validate assumptions against current schema before rollout.

## Review checklist (before merge)

1. Migration file follows naming convention.
2. Migration is registered in `src/main/libs/migrate.ts`.
3. `up` and `down` both call `next()`.
4. New columns have correct type/default/nullability.
5. Trigger/index/table changes do not break existing queries/models.
6. `updatedAt` behavior is preserved via triggers for changed tables.
7. App starts successfully against:
   - clean DB
   - existing DB from previous app version

## Local verification flow

1. Run app once to apply migrations.
2. Inspect database schema (`wf.db`) and confirm expected changes.
3. Validate critical app flows:
   - node create/start/stop
   - worker create/import/remove
   - status/snapshot background jobs
4. Check logs for migration errors during startup.
