# Task Status

## Metadata

| Field | Value |
| --- | --- |
| Task ID | `t-022-runner-task-registration` |
| Title | Make runner work visible only after task registration |
| Priority | 1 |
| Phase | done |
| Owner Role | Controller |
| Depends On | `t-021-harness-behavioral-discipline` |
| Created | 2026-05-06 |
| Updated | 2026-05-06 |

## Goal

Close the runner lifecycle loophole where an agent can run for several minutes while the task is not registered in the queue/state mirrors, leaving SharkBay unable to show the work in the task list.

## Scope

In scope:

- Clarify harness protocol so task registration happens before runner `running` status.
- Add SharkBay diagnostics for runner metadata that points at an unregistered task.
- Ensure unregistered active runner work surfaces as user action instead of disappearing.
- Add focused tests and task evidence.

Out of scope:

- Directly launching Codex from SharkBay.
- Multi-runner arbitration.
- Broad redesign of task list layout.

## Current Gate

| Gate | Status | Notes |
| --- | --- | --- |
| Dependencies | pass | `t-021-harness-behavioral-discipline` is done. |
| Contract | pass | User identified a concrete loophole; the minimal fix is protocol discipline plus product diagnostics. |
| Coding | pass | Reader/workflow diagnostics and protocol/template updates implemented. |
| Code review | pass | Self-review found the need to include state currentTask mismatch; fixed before verification. |
| Verification | pass | `npm run typecheck`, focused tests, full `npm test`, `npm run build`, and `git diff --check` passed. |
| Docs update | pass | `docs/task.md`, `docs/learnings.md`, harness docs, and setup templates updated. |

## Next Action

Task complete.

## Open Questions

| Question | Blocks Phase | Owner |
| --- | --- | --- |
| none | none | none |

## History

| Date | Phase | Summary |
| --- | --- | --- |
| 2026-05-06 | intake -> coding | Opened a focused implementation task from the user's runner/task visibility finding. |
| 2026-05-06 | coding -> verification | Implemented task-first runner protocol rules and missing/inactive/mismatched runner diagnostics. |
| 2026-05-06 | verification -> done | Verification and docs update passed; task marked done. |
