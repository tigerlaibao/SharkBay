# Implementation Contract

## Done Criteria

- `README.md` describes the current SharkBay workbench capabilities, including runner lifecycle, right detail tabs, and project terminal workspaces.
- The README development section mentions native terminal rebuild needs.
- Harness task/state files record this ad hoc docs/publish task.
- The updated branch is committed and pushed to `origin/main`.

## Verification Methods

- Run `git diff --check`.
- Run `jq empty .agent/manifest.json .agent/state.json .agent/queue.json .agent/runner.json`.
- Inspect `README.md` against `docs/product.md`, `docs/architecture.md`, and `docs/task.md`.
- Confirm `git push origin main` exits 0.

## Files In Scope

- `README.md`
- `.agent/queue.json`
- `.agent/queue.md`
- `.agent/state.json`
- `.agent/state.md`
- `.agent/runner.json`
- `docs/task.md`
- `tasks/t-025-readme-publish/**`

## Files Out Of Scope

- `src/**`
- `electron/**`
- `tests/**`
- `package.json`
- `package-lock.json`

## Stop Conditions

- Stop before changing app behavior or dependencies.
- Stop if push is rejected for remote divergence.
- Stop if a verification command fails and cannot be corrected inside this docs-only scope.
