# Verification

## Checks

- `npm test -- renderer-workflow.test.ts`
  - Exit code: 0
  - Output excerpt: `tests/renderer-workflow.test.ts  (9 tests)` and `1 passed (1)`.
- `npm run typecheck`
  - Exit code: 0
  - Output excerpt: `tsc -p tsconfig.renderer.json --noEmit && tsc -p tsconfig.node.json --noEmit`.
- `git diff --check`
  - Exit code: 0
  - Output excerpt: no output.
- `npm run build`
  - Exit code: 0
  - Output excerpt: `✓ built in 575ms`.
  - Note: Vite emitted the existing large chunk warning.
- `npm test`
  - Exit code: 0
  - Output excerpt: `Test Files  16 passed (16)` and `Tests  91 passed (91)`.

## Done Criteria Mapping

- Project with only service tabs does not show left-row activity label: covered by `projectTerminalActivityStates` focused test returning `{}` for service-only tabs.
- Non-service tab labels still work with service tabs present: covered by mixed focused test returning `working` and `idle` from non-service tabs.
- Service running indicators unchanged: implementation does not change the separate `runningServiceProjectIds` aggregation.
