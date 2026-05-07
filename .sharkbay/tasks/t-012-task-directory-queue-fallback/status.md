# Task Status

## Metadata

| Field | Value |
| --- | --- |
| Task ID | `t-012-task-directory-queue-fallback` |
| Title | Show task directories when queue metadata is incomplete |
| Priority | 1 |
| Phase | done |
| Owner Role | Controller |
| Depends On | `t-011-runner-lifecycle-heartbeat` |
| Created | 2026-05-05 |
| Updated | 2026-05-05 |

## Goal

Fix the project detail task list so real managed projects do not hide task folders when `.agent/queue.json` uses older done-entry shorthand or is missing task directory entries.

## Scope

In scope:

- Normalize done queue entries that use `completed` without explicit `phase` and `status`.
- Add read-only task directory fallback rows for safe `tasks/<task-id>/status.md` directories missing from queue metadata.
- Cover the AIGF-style mismatch with tests.

Out of scope:

- Mutating managed project queue files automatically.
- Adding write/sync UI for repairing project metadata.

## Current Gate

| Gate | Status | Notes |
| --- | --- | --- |
| Dependencies | pass | `t-011-runner-lifecycle-heartbeat` is done. |
| Spec | pass | Bug scope is concrete from AIGF repro. |
| Design review | pass | Additive read-only fallback; no write path changes. |
| Contract | pass | Limit changes to reader/schema tests and docs. |
| Code review | pass | `tasks/t-012-task-directory-queue-fallback/code-review.md` found no blocker or major issues. |
| Verification | pass | `npm run typecheck`, focused reader tests, full test suite, `npm run build`, and AIGF reader probe passed. |
| Docs update | pass | Queue, state, task docs, and learnings updated. |

## Next Action

Ready for the next task.

## Open Questions

| Question | Blocks Phase | Owner |
| --- | --- | --- |

## History

| Date | Phase | Summary |
| --- | --- | --- |
| 2026-05-05 | coding | Reproduced AIGF task visibility issue from queue/task directory mismatch. |
| 2026-05-05 | done | Fixed section-specific queue normalization and task directory fallback visibility. |
