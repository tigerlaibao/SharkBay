# Verification

## Checks Run

| Check | Command | Exit Code | Result | Evidence |
| --- | --- | --- | --- | --- |
| Typecheck | `npm run typecheck` | 0 | pass | TypeScript renderer and node projects completed. |
| Focused reader tests | `npm test -- tests/harness-reader.test.ts` | 0 | pass | 9 harness reader tests passed. |
| Full test suite | `npm test` | 0 | pass | 8 files / 41 tests passed. |
| Production build | `npm run build` | 0 | pass | Node compile and Vite production build completed. |
| AIGF reader probe | `node -e "import('./dist-electron/src/main/harness-reader.js').then(...)"` | 0 | pass | Read `/Users/shark/Projects/AIGF`: backlog `t-006,t-007,t-008`, done `t-005,t-004,t-003,t-002,t-001`, activeTask title `Community interaction UI`. |

## Evidence Artifacts

| Type | Path | Notes |
| --- | --- | --- |

## Manual Verification

| Scenario | Steps | Observed Result | Evidence |
| --- | --- | --- |

## Cross-Validation

| Critical Behavior | Test or Script | Result | Notes |
| --- | --- | --- | --- |
| Backlog and done section shorthand remains visible. | `tests/harness-reader.test.ts` | pass | Backlog defaults to `backlog`; done defaults to `done`. |
| Unqueued task directories are visible. | `tests/harness-reader.test.ts` | pass | Safe `tasks/<task-id>/status.md` fallback row is included with `source=tasks-directory`. |

## Skipped Checks

| Check | Reason | Risk |
| --- | --- | --- |

## Result

- [x] Pass
- [ ] Fail
