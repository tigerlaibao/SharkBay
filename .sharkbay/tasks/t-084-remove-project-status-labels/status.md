# Task Status

- Task ID: `t-084-remove-project-status-labels`
- Title: Remove project status labels
- Phase: done
- Status: done
- Priority: 1
- Depends on: none
- Started: 2026-05-09T16:26:08+08:00

## Request

Remove the project status labels that were moved to the right Tasks tab. Also investigate which state machines and harness protocol fields exist only for showing those labels and can be removed, while keeping task phases.

## Progress

- Registered active task.
- Started code/protocol usage audit.
- Removed the right Tasks tab project status strip.
- Removed the app-derived `taskStatus` summary and renderer-only label helpers/styles that only supported the removed project status labels.
- Kept task phase rendering and documented remaining harness/protocol consumers.
- Verification passed.

## Verification Plan

- `npm run typecheck`
- `npm run build`
- `git diff --check`

## Completed

2026-05-09T16:33:00+08:00
