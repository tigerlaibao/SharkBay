# Implementation

## Changes

- `src/main/harness-reader.ts` now treats missing task artifact markdown files as normal empty artifact values instead of harness errors.
- `src/renderer/App.tsx` now renders queue metadata when a task detail page has no readable artifact markdown.
- `src/renderer/types.ts` includes queue shorthand display fields such as `notes`, `completed`, and `completedAt`.
- `src/styles/app.css` adds compact metadata rows for artifact-less task detail pages.
- `tests/harness-reader.test.ts` verifies queued tasks without artifact directories produce null artifacts without misleading errors.

## AIGF Finding

AIGF backlog task `t-008-conversion-measurement-and-admin` exists only in `.agent/queue.json`; there is no `tasks/t-008-conversion-measurement-and-admin/` directory yet. The queue entry contains enough decision context to display:

- Priority: `3`
- Depends on: `t-004-interaction-api`
- Notes: `Add safe admin/reporting views and conversion event storage after production backend approval.`
