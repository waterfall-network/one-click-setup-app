# AGENTS Guide

This file helps coding agents navigate project docs and follow the expected delivery workflow.

## Primary Documentation Index

Start here first:

- `docs/README.md`

## Documentation Map by Task

- Product context and scope: `docs/overview.md`
- Architecture and runtime model: `docs/architecture.md`
- Repository/module layout: `docs/project-structure.md`
- Setup and local run/build: `docs/getting-started.md`
- Env/config variables: `docs/configuration.md`
- Code conventions: `docs/code-style.md`
- Renderer/Main IPC contracts: `docs/ipc-api.md`
- SQLite schema and statuses: `docs/data-model.md`
- Migration rules: `docs/migration-guidelines.md`
- Development process: `docs/development-workflow.md`
- Security requirements: `docs/security.md`
- PR checks: `docs/pr-checklist.md`
- Packaging/release: `docs/build-and-release.md`

<!-- BEGIN BEADS INTEGRATION -->

## Issue Tracking with bd (beads)

**IMPORTANT**: This project uses **bd (beads)** for ALL issue tracking. Do NOT use markdown TODOs, task lists, or other tracking methods.

### Why bd?

- Dependency-aware: Track blockers and relationships between issues
- Git-friendly: Auto-syncs to JSONL for version control
- Agent-optimized: JSON output, ready work detection, discovered-from links
- Prevents duplicate tracking systems and confusion

### Quick Start

**Check for ready work:**

```bash
bd ready --json
```

**Create new issues:**

```bash
bd create "Issue title" --description="Detailed context" -t bug|feature|task -p 0-4 --json
bd create "Issue title" --description="What this issue is about" -p 1 --deps discovered-from:bd-123 --json
```

**Claim and update:**

```bash
bd update bd-42 --status in_progress --json
bd update bd-42 --priority 1 --json
```

**Complete work:**

```bash
bd close bd-42 --reason "Completed" --json
```

### Issue Types

- `bug` - Something broken
- `feature` - New functionality
- `task` - Work item (tests, docs, refactoring)
- `epic` - Large feature with subtasks
- `chore` - Maintenance (dependencies, tooling)

### Priorities

- `0` - Critical (security, data loss, broken builds)
- `1` - High (major features, important bugs)
- `2` - Medium (default, nice-to-have)
- `3` - Low (polish, optimization)
- `4` - Backlog (future ideas)

### Workflow for AI Agents

1. **Check ready work**: `bd ready` shows unblocked issues
2. **Claim your task**: `bd update <id> --status in_progress`
3. **Work on it**: Implement, test, document
4. **Discover new work?** Create linked issue:
   - `bd create "Found bug" --description="Details about what was found" -p 1 --deps discovered-from:<parent-id>`
5. **Complete**: `bd close <id> --reason "Done"`

### Auto-Sync

bd automatically syncs with git:

- Exports to `.beads/issues.jsonl` after changes (5s debounce)
- Imports from JSONL when newer (e.g., after `git pull`)
- No manual export/import needed!

### Important Rules

- ✅ Use bd for ALL task tracking
- ✅ Always use `--json` flag for programmatic use
- ✅ Link discovered work with `discovered-from` dependencies
- ✅ Check `bd ready` before asking "what should I work on?"
- ❌ Do NOT create markdown TODO lists
- ❌ Do NOT use external issue trackers
- ❌ Do NOT duplicate tracking systems

For more details, see README.md and docs/QUICKSTART.md.

<!-- END BEADS INTEGRATION -->

## Project-Specific Rules

These rules extend (and do not replace) the Beads workflow above.

1. Documentation-first navigation:
   - Start with `docs/README.md`
   - Use task-specific docs from `docs/*` before coding

2. Mandatory docs update policy:
   - If behavior/config/schema changes, update corresponding docs in the same task
   - Minimum check:
     - API/IPC changes -> `docs/ipc-api.md`
     - DB schema/migrations -> `docs/data-model.md`, `docs/migration-guidelines.md`
     - Security-sensitive changes -> `docs/security.md`
     - Build/release changes -> `docs/build-and-release.md`

3. Migration requirements:
   - Follow `docs/migration-guidelines.md`
   - Keep migrations additive where possible
   - Preserve `updatedAt` trigger behavior for SQLite tables

4. Security requirements:
   - Follow `docs/security.md`
   - Never log secrets (mnemonic/private key/passwords)
   - Validate IPC inputs in main process handlers

5. Code style requirements:
   - Follow `docs/code-style.md`
   - Run project quality gates for changed scope:
     - `npm run typecheck`
     - `npm run lint`
     - `npm run format` (if formatting changed)

6. Source of truth:
   - If docs conflict with code, code is source of truth
   - Update docs immediately after resolving mismatch

7. Changelog before commit:
   - Before each commit, update `src/renderer/src/pages/Changelog/index.tsx`
   - Use `package.json` `version` as the source of truth for the target release section (for display, `0.6.0-beta` -> `0.6.0 beta`)
   - Add short, user-facing bullet(s) describing the work completed in that commit

<!-- bv-agent-instructions-v1 -->

---

## Beads Workflow Integration

This project uses [beads_viewer](https://github.com/Dicklesworthstone/beads_viewer) for issue tracking. Issues are stored in `.beads/` and tracked in git.

### Essential Commands

```bash
# View issues (launches TUI - avoid in automated sessions)
bv

# CLI commands for agents (use these instead)
bd ready              # Show issues ready to work (no blockers)
bd list --status=open # All open issues
bd show <id>          # Full issue details with dependencies
bd create --title="..." --type=task --priority=2
bd update <id> --status=in_progress
bd close <id> --reason="Completed"
bd close <id1> <id2>  # Close multiple issues at once
bd sync               # Commit and push changes
```

### Workflow Pattern

1. **Start**: Run `bd ready` to find actionable work
2. **Claim**: Use `bd update <id> --status=in_progress`
3. **Work**: Implement the task
4. **Complete**: Use `bd close <id>`
5. **Sync**: Always run `bd sync` at session end

### Key Concepts

- **Dependencies**: Issues can block other issues. `bd ready` shows only unblocked work.
- **Priority**: P0=critical, P1=high, P2=medium, P3=low, P4=backlog (use numbers, not words)
- **Types**: task, bug, feature, epic, question, docs
- **Blocking**: `bd dep add <issue> <depends-on>` to add dependencies

### Session Protocol

**Before ending any session, run this checklist:**

```bash
git status              # Check what changed
# update changelog       # Add short bullet(s) under the release matching package.json version
git add <files>         # Stage code changes
bd sync                 # Commit beads changes
git commit -m "..."     # Commit code
bd sync                 # Commit any new beads changes
git push                # Push to remote
```

### Best Practices

- Check `bd ready` at session start to find available work
- Update status as you work (in_progress → closed)
- Create new issues with `bd create` when you discover tasks
- Use descriptive titles and set appropriate priority/type
- Always `bd sync` before ending session

<!-- end-bv-agent-instructions -->
