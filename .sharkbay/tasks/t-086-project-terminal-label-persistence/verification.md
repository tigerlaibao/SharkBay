# Verification

## Checks

- `npm test -- renderer-workflow.test.ts`
  - Exit code: 0
  - Output excerpt: `tests/renderer-workflow.test.ts  (8 tests)` and `1 passed (1)`.
- `npm run typecheck`
  - Exit code: 0
  - Output excerpt: `tsc -p tsconfig.renderer.json --noEmit && tsc -p tsconfig.node.json --noEmit`.
- `git diff --check`
  - Exit code: 0
  - Output excerpt: no output.
- `npm run build`
  - Exit code: 0
  - Output excerpt: `✓ built in 517ms`.
  - Note: Vite emitted the existing large chunk warning.
- `npm test`
  - Exit code: 0
  - Output excerpt: `Test Files  16 passed (16)` and `Tests  90 passed (90)`.

## Done Criteria Mapping

- Working label remains visible across project selection while terminal activity continues: covered by filtering xterm focus control sequences from input observation resets and focused helper tests.
- Idle label is yellow: covered by CSS source update for base and Night `.terminal-activity-pill.is-idle`.
- Existing labels continue to render: covered by typecheck, build, focused tests, and full test suite.
