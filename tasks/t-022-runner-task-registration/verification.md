# Verification

## Results

| Check | Exit | Evidence |
| --- | --- | --- |
| `npm run typecheck` | 0 | `tsc -p tsconfig.renderer.json --noEmit && tsc -p tsconfig.node.json --noEmit` completed. |
| `npm test -- tests/harness-reader.test.ts tests/renderer-workflow.test.ts` | 0 | 2 files passed, 19 tests passed. |
| `npm test` | 0 | 10 files passed, 52 tests passed. |
| `npm run build` | 0 | TypeScript node build and Vite production build completed; Vite reported the existing chunk-size warning. |
| `git diff --check` | 0 | No whitespace errors. |

## Behavior Verified

- A live runner whose `taskId` is missing from queue/tasks is annotated as `missing`, records a diagnostic, and appears in `Needs Action`.
- A live runner whose task exists only outside Active is annotated as `inactive`, records a diagnostic, and appears in `Needs Action`.
- A live runner whose task is Active but does not match `.agent/state.json` currentTask is annotated as `mismatched`, records a diagnostic, and appears in `Needs Action`.
- An idle runner with stale task registration metadata does not create user action.
- Empty `state.currentTask.taskId` no longer creates a phantom active task.
