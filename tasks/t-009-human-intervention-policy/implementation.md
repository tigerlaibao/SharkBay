# Implementation

## Summary

Implemented a first human-intervention policy for SharkBay:

- `Needs Action` now means the user must intervene, not that work is merely active or dirty.
- Dirty worktree alone no longer lists a project in the left sidebar.
- Normal Codex phases, including review and verification, stay quiet unless an explicit user-action flag or block is recorded.
- Explicit `requiresUserAction`, `userActionRequired`, `userActionReason`, blocked phase, or blocked gate can put a project in `Needs Action`.

## Files Changed

| File | Change |
| --- | --- |
| `src/renderer/workflow.ts` | Added `projectNeedsUserAction` and `userActionReason` policy helpers. |
| `src/renderer/App.tsx` | Sidebar uses the workflow policy and shows action reason when present. |
| `src/main/harness-reader.ts` | Reads optional user-action fields from queue/state active task data. |
| `src/shared/types.ts`, `src/renderer/types.ts` | Added user-action fields to active task summaries. |
| `tests/renderer-workflow.test.ts` | Added policy coverage. |
| `.agent/protocol.md` | Added Human Intervention Discipline. |

## UI Evidence

With `t-009` active in `coding` and the worktree dirty, SharkBay shows `t-009` in the right-side `Tasks` list but does not show the left `Needs Action` section.
