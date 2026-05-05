# Implementation Contract

## 1. Objective

Complete an autonomous UX polish pass before Ripple setup, applying the generalized UX Entity Discipline to the current app.

## 2. In Scope

- Renderer UI cleanup in project list/detail/queue surfaces.
- CSS layout/style changes required by the cleanup.
- Harness queue/state/docs updates for the new task.
- Implementation, review, and verification artifacts for this task.

## 3. Out of Scope

- Ripple setup write flow.
- New filesystem writes outside existing harness/task metadata.
- New third-party UI dependencies.
- Broad architecture refactors.

## 4. Files Allowed to Change

| Path | Reason |
| --- | --- |
| `src/renderer/App.tsx` | UI display behavior. |
| `src/styles/app.css` | Layout and component styling. |
| `.agent/queue.md` | Human-readable queue update. |
| `.agent/queue.json` | Machine-readable queue update. |
| `.agent/state.md` | Human-readable current task update. |
| `.agent/state.json` | Machine-readable current task update. |
| `docs/task.md` | Task summary update. |
| `tasks/t-006-autonomous-ux-polish/*` | Harness artifacts. |

## 5. Done Criteria

- New UX task is active before Ripple setup.
- UI changes pass self-review with no blocker or major UX findings.
- Required automated checks pass.
- Verification evidence is recorded.
- Work is committed in focused checkpoints.

## 6. Required Checks

| Check | Command | Required |
| --- | --- | --- |
| Typecheck | `npm run typecheck` | yes |
| Tests | `npm test` | yes |
| Build | `npm run build` | yes |
| Diff whitespace | `git diff --check` | yes |

## 7. Cross-Validation Requirement

| Critical Behavior | Test/Script | Evidence Expected |
| --- | --- | --- |
| Renderer still compiles after UI cleanup | `npm run typecheck` | Exit 0 |
| Existing scanner/workflow behavior is preserved | `npm test` | Exit 0 |

## 8. Stop Conditions

Stop and ask the user if:

- Scope needs to expand into Ripple setup implementation.
- A required check cannot run.
- A destructive filesystem action appears necessary.
- A visual decision needs explicit product direction.
