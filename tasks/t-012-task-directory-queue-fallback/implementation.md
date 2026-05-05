# Implementation Notes

## Summary

Fixed task list visibility for managed projects whose `.agent/queue.json` uses section-specific queue shapes. Backlog entries now normalize to `phase/status=backlog`, done entries normalize to `phase/status=done`, and task directories with `status.md` are added as read-only fallback rows when they are missing from the queue.

## Changes

| Path | Summary |
| --- | --- |
| `src/main/harness-reader.ts` | Normalizes queue sections by their own shape, merges safe task directory fallback rows, and enriches state currentTask fallback from matching queue metadata. |
| `src/shared/schema.ts` | Validates backlog and done queue shorthand according to section rules instead of requiring active-task fields everywhere. |
| `tests/harness-reader.test.ts` | Covers AIGF-style queue sections plus a task-directory-only fallback row. |

## Decisions During Implementation

| Decision | Reason |
| --- | --- |
| Treat section-specific backlog/done entries as valid queue data. | `.agent/queue.md` defines different columns for Active, Backlog, and Done; the reader should match the harness rule. |
| Keep task directory fallback read-only. | `tasks/` visibility helps diagnose drift without mutating managed projects unexpectedly. |

## Known Risks

| Risk | Follow-up |
| --- | --- |
| Fallback rows are inferred from Markdown metadata. | They are used only when queue metadata lacks the task id and carry `source=tasks-directory`. |
