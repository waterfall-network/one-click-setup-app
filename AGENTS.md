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

<!-- BEGIN BEADS INTEGRATION v:1 profile:full hash:f65d5d33 -->
## Issue Tracking with bd (beads)

**IMPORTANT**: This project uses **bd (beads)** for ALL issue tracking. Do NOT use markdown TODOs, task lists, or other tracking methods.

### Why bd?

- Dependency-aware: Track blockers and relationships between issues
- Git-friendly: Dolt-powered version control with native sync
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
bd update <id> --claim --json
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
2. **Claim your task atomically**: `bd update <id> --claim`
3. **Work on it**: Implement, test, document
4. **Discover new work?** Create linked issue:
   - `bd create "Found bug" --description="Details about what was found" -p 1 --deps discovered-from:<parent-id>`
5. **Complete**: `bd close <id> --reason "Done"`

### Quality
- Use `--acceptance` and `--design` fields when creating issues
- Use `--validate` to check description completeness

### Lifecycle
- `bd defer <id>` / `bd supersede <id>` for issue management
- `bd stale` / `bd orphans` / `bd lint` for hygiene
- `bd human <id>` to flag for human decisions
- `bd formula list` / `bd mol pour <name>` for structured workflows

### Auto-Sync

bd automatically syncs via Dolt:

- Each write auto-commits to Dolt history
- Remote Dolt sync is not configured in this project
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

## Session Completion

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
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
   - Keep change bullets ordered by type: `New`, `Improve`, `Update`, `Fix`

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
bd update <id> --claim
bd close <id> --reason="Completed"
bd close <id1> <id2>  # Close multiple issues at once
```

### Workflow Pattern

1. **Start**: Run `bd ready` to find actionable work
2. **Claim**: Use `bd update <id> --claim`
3. **Work**: Implement the task
4. **Complete**: Use `bd close <id>`
5. **Sync**: Follow standard git sync only

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
git commit -m "..."     # Commit code
git pull --rebase       # Update branch before pushing
git push                # Push to remote
```

### Best Practices

- Check `bd ready` at session start to find available work
- Update status as you work (in_progress → closed)
- Create new issues with `bd create` when you discover tasks
- Use descriptive titles and set appropriate priority/type
- Finish with a clean issue state in `bd` and pushed git branch

<!-- end-bv-agent-instructions -->
