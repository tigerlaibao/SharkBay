# Verification

## Commands

- `npm run typecheck`
  - Exit code: 0
- `npm test -- tests/renderer-workflow.test.ts tests/harness-reader.test.ts`
  - Exit code: 0
  - Result: 2 files passed, 24 tests passed.
- `npm run build`
  - Exit code: 0
  - Result: Vite production build completed. Existing chunk-size warning remains for the renderer bundle.
- `rg -n "taskStatus|ProjectTaskStatus|taskStatusKind|taskStatusLabel|ProjectStatusStrip|StatusPill|status-pill|runner-pill|harness-pill|project-status-strip" src tests .sharkbay/tasks/t-084-remove-project-status-labels`
  - Exit code: 0
  - Result: only investigation notes and `prompt-generator.ts` task status file path naming remain.
- `git diff --check`
  - Exit code: 0

## Done Criteria

- Right Tasks tab no longer renders the moved project status label row.
- Task queue phases remain in the app model and tests.
- Dead renderer helpers/styles for the removed labels are deleted.
- Investigation notes identify removable and retained state/protocol candidates.
