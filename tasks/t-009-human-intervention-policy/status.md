# Task Status

## Metadata

| Field | Value |
| --- | --- |
| Task ID | `t-009-human-intervention-policy` |
| Title | Define human intervention signals |
| Priority | 1 |
| Phase | done |
| Owner Role | Controller |
| Depends On | `t-008-project-authored-url-metadata` |
| Created | 2026-05-05 |
| Updated | 2026-05-05 |

## Goal

Make SharkBay's left sidebar a real attention surface: projects appear there only when the user needs to decide, approve, review, verify, or unblock something. Normal done, clean, coding, and other auto-advancing states should stay quiet.

## Scope

In scope:

- Define the intervention policy in the harness protocol.
- Update renderer logic so `Needs Action` follows that policy.
- Keep active/done/backlog tasks in the project task list, not as separate sidebar entities.
- Add tests for the action/no-action boundary.

Out of scope:

- Building background automation that advances tasks by itself.
- Running Codex from SharkBay.
- Notification center, badges, or OS-level alerts.

## Current Gate

| Gate | Status | Notes |
| --- | --- | --- |
| Dependencies | pass | `t-008-project-authored-url-metadata` is done. |
| Spec | pass | User goal is explicit and core to product value. |
| Design review | pass | Narrow policy/UI slice; no broad architecture change. |
| Contract | pass | Files and checks are scoped below. |
| Code review | pass | Self-review passed. |
| Verification | pass | Typecheck, focused tests, full tests, build, JSON parse, UI check, and diff check passed. |
| Docs update | pass | Protocol, queue, state, task docs, learnings, and checkpoint commits updated. |

## Next Action

Ready for the next task.

## Open Questions

| Question | Blocks Phase | Owner |
| --- | --- | --- |

## History

| Date | Phase | Summary |
| --- | --- | --- |
| 2026-05-05 | done -> coding | Opened from user feedback that all-done projects should not require action. |
| 2026-05-05 | coding -> verification | Implemented the human-intervention policy and verified UI behavior. |
| 2026-05-05 | verification -> docs_update | Verification passed; final checkpoint still pending. |
| 2026-05-05 | docs_update -> done | Final checkpoint committed and task marked done. |
