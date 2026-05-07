# Contract

## Done Criteria And Verification

| Criterion | Verification |
| --- | --- |
| Current template version is computed from version-owned tracked files | Focused unit test checks version/file hash output |
| New installs write sync metadata | `tests/template-installer.test.ts` assertion |
| Stale installed control files are detected | Focused unit test with edited `AGENTS.md` |
| Update writes only version-owned files | Focused unit test verifies `docs/product.md` and `.agent/state.json` remain unchanged |
| Safety rejects paths outside configured roots and symlinked targets | Focused unit test for unsafe root/symlink behavior |
| Existing public checks still pass | `npm run typecheck`, focused tests, `npm run build`, `git diff --check` |

## Files In Scope

- `src/main/harness-template-sync.ts`
- `src/main/template-installer.ts`
- `src/main/path-safety.ts` only if a reusable helper is needed
- `src/shared/types.ts`
- `tests/harness-template-sync.test.ts`
- `tests/template-installer.test.ts`
- Task/status docs and relevant public docs

## Files Out Of Scope

- Renderer UI beyond type fallout.
- Bulk background scheduler.
- Existing external managed projects such as AIBF/AIGF.
- Secrets, credentials, deployment, or publishing.

## Required Checks

- `npm run typecheck`
- `npm test -- tests/harness-template-sync.test.ts tests/template-installer.test.ts`
- `npm run build`
- `git diff --check`

## Stop Conditions

- Updating project-owned state/history files becomes necessary.
- A required check cannot run for reasons unrelated to this task.
- Implementing a background scheduler or UI bulk-update flow becomes necessary.
