# Design

## 1. Summary

Create a project-centered workbench without changing core backend authority. The app should show Projects as the default workspace, Settings as the home for roots and repository creation, and project detail as a progressive disclosure surface.

## 2. Proposed Approach

- Left nav: `Projects` and `Settings` only.
- Sidebar status: show compact root/project counts rather than root management controls.
- Projects view: show a short workbench intro, scan action, search/filter row, and a cleaner project table.
- Detail pane: make `ProjectSummaryCard` the first thing, with current task, phase, gate, dirty state, URLs, and primary actions.
- Ripple internals: keep queue, revisions, prompt, artifacts, decisions, and diagnostics available but grouped after the summary.
- Settings view: combine root management and create repo into one low-frequency operations page.

## 3. Files and Modules

| File/Module | Change | Reason |
| --- | --- | --- |
| `src/renderer/App.tsx` | Rework nav, dashboard, detail hierarchy, and settings composition. | Main UX change. |
| `src/styles/app.css` | Add workbench/detail/settings layout styles and reduce visual density. | UI polish. |
| `src/renderer/workflow.ts` | Add small presentational helpers if needed. | Keep UI logic testable. |
| `tests/renderer-workflow.test.ts` | Cover helper behavior if changed. | Preserve focused workflow checks. |
| `docs/product.md` | Capture project/Ripple model. | Product direction. |
| `docs/task.md` | Track task status. | Harness docs. |

## 4. Data/API/UI Impact

No backend authority changes in this slice. Existing `scanProjects` still returns Ripple-enabled projects only; the UI will label that honestly and leave broader root child project discovery for the next task.

## 5. Edge Cases

| Case | Handling |
| --- | --- |
| No roots configured | Projects view shows a quiet empty state pointing to Settings. |
| No Ripple projects found | Projects view explains that Settings can create a Ripple-enabled repo and future work will adopt existing directories. |
| Detail not loaded yet | Summary uses project row data until full detail arrives. |
| Narrow window | Dashboard stacks to one column. |

## 6. Risks

| Risk | Mitigation |
| --- | --- |
| Renaming harness to Ripple could confuse existing docs | Use Ripple for UI, harness for technical file/protocol docs. |
| Deferring non-harness discovery does not fully satisfy user model | Record it explicitly as the next backend task. |
| Large UI edit can regress existing actions | Keep existing components and handlers, only reorganize surfaces. |

## 7. Verification Plan

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`
- `git diff --check`
- `npm run dev` smoke if feasible
