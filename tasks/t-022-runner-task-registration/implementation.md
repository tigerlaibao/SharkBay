# Implementation

## Summary

Implemented a task-first runner lifecycle fix:

- Added runner task registration status to shared and renderer types.
- Annotated runner metadata during project reads as `active`, `inactive`, `missing`, or `mismatched`.
- Added diagnostics when a live runner points to a task that is missing from queue/tasks, present outside Active, or different from `.agent/state.json` currentTask.
- Made `Needs Action` surface these runner/task registration problems even when no active task exists.
- Tightened currentTask normalization so an empty `state.currentTask.taskId` does not become a phantom active task.
- Updated SharkBay and template harness instructions so ad-hoc work must be registered before writing `runner.status=running`.

## Evidence

| Check | Result | Notes |
| --- | --- | --- |
| `npm run typecheck` | pass | Renderer and node TypeScript projects compile. |
| `npm test -- tests/harness-reader.test.ts tests/renderer-workflow.test.ts` | pass | Focused reader/workflow tests cover missing, inactive, and mismatched runner task registration. |
| `npm test` | pass | 52 tests passed. |
| `npm run build` | pass | Production build completed; Vite emitted the existing large chunk warning. |
| `git diff --check` | pass | No whitespace errors. |

## Notes

`.agent/runner.json` remains local runtime state and should not be committed.
