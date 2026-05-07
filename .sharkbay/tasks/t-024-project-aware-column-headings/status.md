# Task Status

## Identity

- Task ID: `t-024-project-aware-column-headings`
- Title: Project-aware workbench column headings
- Priority: 1
- Status: done
- Phase: done
- Depends on: `t-023-terminal-title-strategy`

## User Goal

Change the workbench column headings so the middle terminal column is titled with the current project name, and remove the redundant project title/path header from the right detail column.

## Scope

- In scope: renderer UI headings in the terminal and right detail column.
- Out of scope: terminal session naming, tab title strategy, task detail page back navigation, scanner data, IPC, filesystem behavior.

## Assumptions

- "Current project name" means the selected managed or not-setup project name.
- The right detail header to remove is the top-level project name/path header in project detail and not-setup detail views.
- Task detail pages can keep their task title and back control because they are no longer showing the project name/path pair.

## Verification Map

- Middle column title uses selected project name: `npm run typecheck`, focused source review.
- Right detail top project name/path header is removed: `npm run typecheck`, focused source review.

## Outcome

- Completed: 2026-05-06T20:24:02+08:00
- Terminal column heading now shows the selected project name.
- Right managed-project and not-setup detail views no longer show the redundant project name/path header.
- Task detail navigation/header remains unchanged.

## Verification Summary

- `npm run typecheck`: passed.
- `git diff --check`: passed.
- `jq empty .agent/manifest.json .agent/state.json .agent/queue.json .agent/runner.json`: passed.
- `npm run build`: passed.

## Runner

- Session: `codex-2026-05-06T20-21-48-local`
- Last heartbeat: 2026-05-06T20:24:02+08:00
- State: idle

## Notes

- Registered as a small ad hoc UI task before runner claim, per repository protocol.
