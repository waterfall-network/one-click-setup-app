# AGENTS Guide

This file helps coding agents navigate project documentation quickly.

## Primary Documentation Index

Start here first:

- `docs/README.md`

## Documentation Map by Task

- Product context and scope:
  - `docs/overview.md`
- System architecture and runtime model:
  - `docs/architecture.md`
- Repository layout and module locations:
  - `docs/project-structure.md`
- Local setup and build commands:
  - `docs/getting-started.md`
- Environment variables and runtime config:
  - `docs/configuration.md`
- Code conventions and formatting:
  - `docs/code-style.md`
- Renderer/Main IPC contracts:
  - `docs/ipc-api.md`
- SQLite schema, enums, triggers:
  - `docs/data-model.md`
- Migration rules and review checklist:
  - `docs/migration-guidelines.md`
- Development process and quality gates:
  - `docs/development-workflow.md`
- Security boundaries and secret handling:
  - `docs/security.md`
- Pre-merge checks:
  - `docs/pr-checklist.md`
- Packaging, updates, and release flow:
  - `docs/build-and-release.md`

## Agent Workflow Requirements

1. Before changing code, read only the relevant docs from the map above.
2. For DB changes, always follow `docs/migration-guidelines.md`.
3. For IPC or secret-related changes, always follow `docs/security.md`.
4. Keep implementation aligned with `docs/code-style.md`.
5. If behavior/config/schema changes, update corresponding docs in the same task.

## Beads Issue Tracking (Mandatory)

This repository uses Beads (`bd`) as the default task tracker.

1. For every non-trivial task, create or pick a Beads issue before code changes.
2. Move issue status to `in_progress` when implementation starts.
3. Link implementation scope to the issue and keep status updated during work.
4. Mark issue `done` only after code changes and related docs updates are complete.
5. Run `bd sync` before finishing the session and before `git push`.

Recommended commands:

- `bd list`
- `bd create "<title>"`
- `bd show <issue-id>`
- `bd update <issue-id> --status in_progress`
- `bd update <issue-id> --status done`
- `bd sync`

## Source of Truth

- If documentation conflicts with code, treat code as source of truth.
- After resolving discrepancies, update docs to match current implementation.

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
