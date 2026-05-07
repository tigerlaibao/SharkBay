# t-031-backlog-task-metadata-detail

## Status

- Title: Show queue metadata for backlog tasks without artifacts
- Phase: done
- Status: done
- Priority: 1
- Depends on: none
- Created: 2026-05-06T22:59:36+08:00
- Updated: 2026-05-06T23:04:53+08:00
- Completed: 2026-05-06

## User Goal

When a backlog task such as AIGF `t-008-conversion-measurement-and-admin` has no `tasks/<task-id>/` artifact directory yet, SharkBay should still show the queue-authored task details so the user can decide whether to work on it.

## Findings

- AIGF `.agent/queue.json` contains backlog task `t-008-conversion-measurement-and-admin` with title, priority, dependency, and notes.
- AIGF has no `tasks/t-008-conversion-measurement-and-admin/` directory, so artifact tabs have no readable markdown.
- SharkBay currently opens the task detail page but renders only artifact markdown, producing "No task detail found" even though queue metadata is available.

## Done Criteria

- Task detail pages show queue metadata when artifact markdown is absent.
- Backlog notes and dependencies are visible from the task drilldown.
- Missing artifact files for queued tasks do not create misleading harness error noise.
- Focused tests, typecheck, build, and diff checks pass.

## Notes

- Scope is limited to read-only display and artifact-missing handling.
- Product commit pending at verification time.
