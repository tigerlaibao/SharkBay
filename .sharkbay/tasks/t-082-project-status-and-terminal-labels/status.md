# Task Status

- Task ID: `t-082-project-status-and-terminal-labels`
- Title: Move project status to Tasks and show terminal activity labels
- Phase: done
- Status: done
- Priority: 1
- Depends on: none
- Started: 2026-05-09T16:07:41+08:00

## Request

Move left-column project status pills to the right Tasks tab top, except dirty should remain in the left project row. In the left project list, show green `working` and yellow `idle` labels based on all terminal tabs for that project, with `working` taking priority over `idle`.

## Progress

- Registered active task.
- Implemented project terminal activity labels and moved status pills to the Tasks tab.
- Verification passed.

## Completed

- Completed: 2026-05-09T16:14:00+08:00

## Verification Plan

- `npm run typecheck`
- `npm run build`
- `git diff --check`
