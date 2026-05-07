# Contract

## Scope

Implement read-only root child discovery and surface managed/not-setup project candidates in the Projects view.

## Files In Scope

| Path | Allowed Changes |
| --- | --- |
| `src/shared/types.ts` | Add `ProjectCandidate`; extend `ScanProjectsResult`. |
| `src/renderer/types.ts` | Mirror scan result/candidate types for preload compatibility. |
| `src/main/scanner.ts` | Add root/direct-child candidate discovery and matching to managed projects. |
| `src/renderer/App.tsx` | Store/render candidates, show not-setup rows, keep managed detail behavior. |
| `src/styles/app.css` | Candidate row status styles as needed. |
| `tests/scanner.test.ts` | Add backend scan coverage for candidates and safety behavior. |
| `tests/renderer-workflow.test.ts` | Add helper coverage if renderer candidate helpers are introduced. |
| Task docs | Update implementation/review/verification/status evidence. |

## Files Out Of Scope

| Path | Reason |
| --- | --- |
| `src/main/template-installer.ts` | No file injection into existing projects in this task. |
| `src/main/harness-writer.ts` | No writes to ordinary folders in this task. |
| Electron IPC channel names | Existing scan channel can carry the additive result. |

## Done Criteria

- `scanConfiguredRoots` returns `candidates` in addition to `projects`.
- Direct child folders under configured roots appear as candidates.
- A configured root that is itself managed appears as a candidate.
- Managed candidates are matched to existing `ProjectSummary` records by real path.
- Not-setup candidates do not produce parse errors and do not appear in `projects`.
- Renderer remains compatible when older scan results omit `candidates`.
- Projects view shows managed and not-setup rows without enabling unsafe writes.

## Required Checks

| Command | Required |
| --- | --- |
| `npm run typecheck` | yes |
| `npm test -- tests/scanner.test.ts` | yes |
| `npm test -- tests/renderer-workflow.test.ts` | yes |
| `npm test` | yes |
| `npm run build` | yes |
| `git diff --check` | yes |

## Stop Conditions

- Stop before adding write/injection behavior for existing non-empty projects.
- Stop if candidate discovery requires reading outside configured roots.
- Stop if a symlinked child directory would be followed.
- Stop if IPC compatibility requires a breaking scan API change.
