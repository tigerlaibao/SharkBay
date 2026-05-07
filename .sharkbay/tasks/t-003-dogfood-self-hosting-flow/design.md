# Design

## 1. Summary

Run the app as a user and make small first-use fixes. The implementation should be driven by observed friction, but constrained to renderer polish, workflow tests, and documentation.

## 2. Proposed Approach

Dogfood checklist:

1. Start `npm run dev`.
2. Inspect the Electron app window.
3. Add or confirm `<projects-root>` as a root.
4. Scan projects.
5. Open SharkBay detail.
6. Inspect active task, phase, queue, artifacts, revisions, errors, URL editor, and prompt panel.
7. Generate/copy prompt.
8. Fix up to three small issues that make this flow confusing.

Likely fix categories:

- unclear empty or loading states;
- cramped detail hierarchy;
- copy/save feedback not obvious;
- self-host marker or phase status not prominent enough;
- root scan metadata not visible enough.

## 3. Files and Modules

| File/Module | Change | Reason |
| --- | --- | --- |
| `src/renderer/App.tsx` | Small UI/interaction fixes discovered during dogfood | Main workflow surface |
| `src/styles/app.css` | Layout/visual feedback adjustments | Usability polish |
| `tests/renderer-workflow.test.ts` | Update/add tests for changed helper behavior | Keep UI helpers covered |
| `tasks/t-003-dogfood-self-hosting-flow/implementation.md` | Record observed friction, changes, and evidence | Harness artifact |

## 4. Data/API/UI Impact

No new IPC should be added. UI should continue using existing bridge methods. Any fix requiring new main-process behavior should stop unless it is a small bug in current workflow metadata.

## 5. Edge Cases

| Case | Handling |
| --- | --- |
| App already has `<projects-root>` configured | Use existing root and rescan. |
| App has no roots | Add `<projects-root>`. |
| Clipboard copy cannot be confirmed | Keep prompt text visible and record the limitation. |
| Observed issue is larger than a small UI fix | Record follow-up instead of expanding scope. |

## 6. Risks

| Risk | Mitigation |
| --- | --- |
| Dogfood turns into unbounded polish | Limit to up to three small fixes. |
| Manual observation misses a regression | Run full automated checks after changes. |
| Fix requires core safety changes | Stop and create a follow-up task. |

## 7. Verification Plan

Required:

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`
- `git diff --check`
- `npm run dev` smoke

Manual evidence:

- app starts;
- root scan finds SharkBay;
- detail opens;
- prompt panel is usable;
- any fixes are listed with before/after observation.
