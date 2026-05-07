# Contract

## Done Criteria And Verification

| Criterion | Verification |
| --- | --- |
| Project rows show stale/missing harness status | Code review of `ProjectTable` rendering plus typecheck/build |
| Detail panel lists affected files and confirms before sync | Code review of `HarnessTemplateSyncPanel` plus typecheck/build |
| Sync refreshes workspace state | Code review of `onRefresh` path plus typecheck |
| Existing app checks pass | `npm run typecheck`, `npm test`, `npm run build`, `git diff --check` |

## Required Checks

- `npm run typecheck`
- `npm test`
- `npm run build`
- `git diff --check`

## Stop Conditions

- A bulk sync-all workflow becomes necessary.
- A merge UI for locally edited version-owned files becomes necessary.
