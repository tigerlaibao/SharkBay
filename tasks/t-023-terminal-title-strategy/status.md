# Task Status

## Metadata

| Field | Value |
| --- | --- |
| Task ID | `t-023-terminal-title-strategy` |
| Title | Improve terminal tab title strategy |
| Priority | 1 |
| Phase | done |
| Owner Role | Controller |
| Depends On | `t-022-runner-task-registration` |
| Created | 2026-05-06 |
| Updated | 2026-05-06 |

## Goal

Make terminal tab titles useful by defaulting to the selected shell's current directory relative to the project root, and showing the foreground command for full-screen or long-running occupying apps such as `top`, `codex`, `claude`, or `pnpm dev:server`.

## Scope

In scope:

- Derive stable terminal tab titles from runtime terminal state instead of project name alone.
- Prefer project-relative current directory for ordinary shells.
- Surface foreground occupying commands in the tab title when a running command is more useful than cwd.
- Add focused tests or validation covering title selection.

Out of scope:

- Replacing the terminal stack.
- Persisting user-custom title overrides.
- Changing process authority or configured-root safety boundaries.

## Current Gate

| Gate | Status | Notes |
| --- | --- | --- |
| Dependencies | pass | `t-022-runner-task-registration` is done. |
| Contract | pass | User provided concrete desired behavior; implementation can stay inside terminal state/title derivation. |
| Coding | pass | Runtime title strategy, IPC update event, and renderer tab updates implemented. |
| Code review | pass | Self-review found and fixed a stale update race after tab close. |
| Verification | pass | Focused terminal tests, typecheck, full test suite, build, and diff check passed. |

## Next Action

Task complete.

## Open Questions

| Question | Blocks Phase | Owner |
| --- | --- | --- |
| none | none | none |

## History

| Date | Phase | Summary |
| --- | --- | --- |
| 2026-05-06 | intake -> coding | Opened focused task from the user's Terminal tab title request. |
| 2026-05-06 | coding -> verification | Implemented runtime-derived terminal titles and update events. |
| 2026-05-06 | verification -> done | Verification and docs update passed; task marked done. |
