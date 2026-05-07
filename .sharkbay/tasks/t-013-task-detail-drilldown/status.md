# Task Status

## Metadata

| Field | Value |
| --- | --- |
| Task ID | `t-013-task-detail-drilldown` |
| Title | Task detail drilldown in project sidebar |
| Priority | 1 |
| Phase | done |
| Owner Role | Controller |
| Depends On | `t-012-task-directory-queue-fallback` |
| Created | 2026-05-05 |
| Updated | 2026-05-05 |

## Goal

Make the project detail right column default to a compact project overview plus task list, and open a full-column task detail page when a task row is selected.

## Current Gate

Done.

## Next Action

Ready for the next task.

## Blockers

None.

## Outcome

Implemented the right-column task drilldown. The project overview now starts with the Tasks list instead of a large current-task artifact preview, and clicking a task opens a full-column detail page with a back button.

## Verification Summary

- `npm run typecheck` passed.
- `npm test` passed.
- `npm run build` passed.
- `git diff --check` passed.
- Vite served the app shell successfully at `http://127.0.0.1:5175/`.
