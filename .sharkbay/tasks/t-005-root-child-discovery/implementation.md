# Implementation Notes

## Summary

Implemented read-only root child discovery.

The scan result now includes a `candidates` array in addition to the existing managed `projects` array. Managed projects keep their full detail path, while ordinary direct child folders appear as `not_setup` candidates. The Projects view now renders both states and shows a read-only setup placeholder for folders that do not have Ripple files yet.

## Changes

| Path | Summary |
| --- | --- |
| `src/shared/types.ts` | Added `ProjectCandidate` and extended `ScanProjectsResult` with `candidates`. |
| `src/main/scanner.ts` | Added direct child candidate discovery, root-as-managed-project handling, symlink/generated-folder skipping, and managed path matching. |
| `src/renderer/types.ts` | Mirrored the candidate scan result shape for preload compatibility. |
| `src/renderer/App.tsx` | Added candidate state, filtering, selection handling, not-setup rows, and a read-only not-setup detail pane. |
| `src/styles/app.css` | Added not-setup row and status styling. |
| `tests/scanner.test.ts` | Added coverage for direct children, nested managed projects, root-as-project, ignored folders, symlink skip, and runtime authority. |

## Decisions During Implementation

| Decision | Reason |
| --- | --- |
| Keep `projects` unchanged and add `candidates`. | This preserves existing managed project behavior and IPC compatibility. |
| Include the configured root itself only when it is managed. | Avoid showing parent folders like `<projects-root>` as fake not-setup projects while still supporting a root configured directly to a repo. |
| Keep setup disabled in the UI. | Writing Ripple files into existing non-empty folders needs a separate confirmation and safety design. |
| Match managed candidates by real path. | Existing project ids are real repo paths, so path matching avoids duplicate rows. |

## Known Risks

| Risk | Follow-up |
| --- | --- |
| Nested managed projects now appear as managed candidates even when their direct parent also appears as not setup. | Later UX may group nested projects under their parent for clarity. |
| Not-setup setup action is visible but disabled. | Implement the confirmation-gated Ripple setup write flow in a later task. |

## Verification Evidence

| Command | Result |
| --- | --- |
| `npm run typecheck` | pass |
| `npm test -- tests/scanner.test.ts` | pass, 6 tests |
| `npm test -- tests/renderer-workflow.test.ts` | pass, 4 tests |
| `npm test` | pass, 8 files / 30 tests |
| `npm run build` | pass |
| `git diff --check` | pass |
