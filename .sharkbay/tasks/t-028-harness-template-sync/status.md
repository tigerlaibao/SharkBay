# t-028-harness-template-sync

## Status

- Title: Keep installed Ripple harness files current from tracked templates
- Phase: done
- Status: done
- Priority: 1
- Depends on: none
- Created: 2026-05-06T21:40:17+08:00
- Updated: 2026-05-06T21:52:00+08:00
- Completed: 2026-05-06

## User Goal

SharkBay should periodically check the managed projects that previously received Ripple harness files from SharkBay setup. When SharkBay's tracked `templates/harness/` files change through commits, installed projects should be able to detect stale harness files and update them.

## Current Assumptions

- `templates/harness/` is the public, git-tracked source of truth for installed harness starter files.
- Existing project runtime/history files such as task statuses, queue/state, decisions, and product docs may contain project-local state and must not be overwritten wholesale without a narrow update policy.
- The first implementation should make drift visible and provide a safe update path instead of silently mutating all discovered projects in the background.

## Done Criteria

- Define which template files are version-owned versus project-owned.
- Add a mechanism to compare installed harness files against the current tracked template source.
- Provide a safe update path for stale version-owned harness files.
- Verify comparison/update behavior with focused automated checks.

## Notes

- Spec, design, design review, and contract passed.
- Coding opened with no dependencies.
- Implementation, code review, and verification passed.
- Documentation updated and task marked done.
- Checkpoint commit: `dcecce4 Add harness template sync checks`.
