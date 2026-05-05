# Implementation Contract

## 1. Objective

Implement the first user-centered project workbench slice by reorganizing the renderer UI and preserving existing runtime behavior.

## 2. In Scope

- Main nav reduced to Projects and Settings.
- Roots and create-repo moved into Settings.
- Project dashboard and detail pane made less dense and more user-centered.
- Ripple status labeling added where user-facing.
- Product/task docs updated.

## 3. Out of Scope

- Backend scanner changes for non-harness directories.
- One-click Ripple adoption for existing directories.
- Dev server process control.
- GitHub/deployment integrations.
- New dependencies.
- Direct Codex execution.

## 4. Files Allowed to Change

| Path | Reason |
| --- | --- |
| `src/renderer/App.tsx` | Reorganize UI. |
| `src/styles/app.css` | Workbench layout and visual polish. |
| `src/renderer/workflow.ts` | Small presentational helpers if needed. |
| `tests/renderer-workflow.test.ts` | Helper tests if needed. |
| `docs/product.md` | Project/Ripple model. |
| `docs/task.md` | Task state. |
| `.agent/state.json` | Current task mirror. |
| `.agent/state.md` | Current task mirror. |
| `.agent/queue.json` | Queue mirror. |
| `.agent/queue.md` | Queue mirror. |
| `tasks/t-004-user-centered-project-workbench/*` | Task artifacts. |

## 5. Done Criteria

- Existing scan/root/create/prompt/detail capabilities remain reachable.
- Projects is the default user-centered workspace.
- Settings contains low-frequency root and create-repo operations.
- Dense harness internals are lower in the detail hierarchy.
- Required checks pass or failures are recorded.

## 6. Required Checks

| Check | Command | Required |
| --- | --- | --- |
| Typecheck | `npm run typecheck` | Yes |
| Lint/static check | `npm run lint` | Yes |
| Tests | `npm test` | Yes |
| Build | `npm run build` | Yes |
| Whitespace | `git diff --check` | Yes |

## 7. Cross-Validation Requirement

| Critical Behavior | Test/Script | Evidence Expected |
| --- | --- | --- |
| Existing renderer helpers | `npm test` | Tests pass. |
| UI compiles | `npm run typecheck` and `npm run build` | No TS/build errors. |

## 8. Stop Conditions

Stop and ask the user if:

- Backend project discovery is required for this slice.
- A fix requires broader filesystem authority.
- New dependencies are needed.
- Direct process/server control is required.
