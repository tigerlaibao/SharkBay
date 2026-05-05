# Implementation Notes

## Summary

Implemented the first user-centered project workbench slice and a follow-up polish pass.

The app now opens around Projects instead of root/create controls. Roots and new project creation moved into Settings, the project list is card-like and scan/status oriented, and the detail pane leads with the selected project's current task, links, next action prompt, queue, task artifacts, diagnostics, and revisions. The polish pass also prevents stale detail from another project appearing during selection changes and softens user-facing copy around saved project links.

## Changes

| Path | Summary |
| --- | --- |
| `src/renderer/App.tsx` | Reframed navigation to Projects/Settings, moved root and create workflows into Settings, rebuilt the project list/detail hierarchy, guarded stale project detail, and replaced several internal-facing messages with product-facing copy. |
| `src/styles/app.css` | Added responsive project workbench, settings, project row, metric, and detail styles; tightened layout breakpoints and long-text truncation. |
| `.agent/protocol.md` | Added checkpoint commit discipline and parallel subagent discipline for future SharkBay work. |

## Decisions During Implementation

| Decision | Reason |
| --- | --- |
| Keep this as a UI-first slice. | Existing backend only discovers Ripple-managed projects; ordinary root child discovery and one-click setup need a separate scanner/API contract. |
| Use “Managed project” for broad UI sections and “Ripple files” when the setup mechanism matters. | This lowers visual pressure while preserving the user's Ripple model. |
| Keep revisions visible but secondary. | They are useful diagnostics and stale-write protection, but should not dominate the main workflow. |
| Commit in small checkpoints. | The user asked for frequent rollback points during development. |

## Known Risks

| Risk | Follow-up |
| --- | --- |
| The app still cannot list ordinary non-Ripple child folders under a root. | Create the next backend task for root child discovery and one-click Ripple setup. |
| The detail pane still exposes queue/artifact internals once expanded. | A later design pass can turn task artifacts into summarized cards with drill-down. |
| Dev server/process controls and GitHub/deploy metadata are not wired yet. | Implement after the project model includes non-Ripple directories and per-project runtime metadata. |

## Verification Evidence

| Command | Result |
| --- | --- |
| `npm run typecheck` | pass |
| `npm test -- tests/renderer-workflow.test.ts` | pass |
| `npm test` | pass, 8 files / 27 tests |
| `npm run build` | pass |
| `git diff --check` | pass |
