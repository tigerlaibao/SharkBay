# Design

## 1. Summary

Use the right side and project queue complaints as signals, then scan the current UI for the same class of issues. Make one coherent polish pass that removes low-value entities, improves labels/order, and makes current work more legible.

## 2. Proposed Approach

1. Audit visible renderer surfaces against UX Entity Discipline.
2. Prioritize issues that can be fixed without new backend capabilities.
3. Implement focused UI improvements in `App.tsx` and `app.css`.
4. Run automated checks.
5. Write a code-review artifact that explicitly tests the result against the UX principles.
6. Revise if the review finds blocker or major issues.

## 3. Files and Modules

| File/Module | Change | Reason |
| --- | --- | --- |
| `src/renderer/App.tsx` | Reduce repeated or low-signal UI entities; improve labels/order; add small helper logic if needed. | Main UI behavior. |
| `src/styles/app.css` | Adjust layout and component styling to match simplified UI. | Visual and spatial quality. |
| `.agent/queue.md`, `.agent/queue.json`, `.agent/state.md`, `.agent/state.json` | Insert new task before Ripple setup. | Harness state. |
| `docs/task.md` | Reflect the new UX task and shifted Ripple setup task. | Human task tracking. |
| `tasks/t-006-autonomous-ux-polish/*` | Record design, implementation, review, and verification. | Harness evidence. |

## 4. Data/API/UI Impact

No backend data contract changes are planned. Renderer-only changes may change how existing queue/detail/project fields are displayed or hidden.

## 5. Edge Cases

| Case | Handling |
| --- | --- |
| A field contains `none`, `unknown`, `unset`, or empty string | Treat as absent display content. |
| Optional groups collapse to one visible group | Let the remaining group use available space. |
| All queue priorities are identical | Hide priority labels. |
| Queue priorities differ | Show clear `P1`/`P2` labels. |

## 6. Risks

| Risk | Mitigation |
| --- | --- |
| Over-removing information the user later needs | Preserve user-triggered settings/details and avoid removing source data. |
| Scope creep into Ripple setup | Keep file scope limited to UI display and harness task metadata. |
| Visual regression without browser review | Use automated checks now; manually review screenshots/running app if needed before finalizing. |

## 7. Verification Plan

- `npm run typecheck`
- `npm test`
- `npm run build`
- `git diff --check`
- Self-review against UX Entity Discipline.
