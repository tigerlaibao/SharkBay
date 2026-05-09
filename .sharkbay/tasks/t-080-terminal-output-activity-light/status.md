# Task Status

- Task ID: `t-080-terminal-output-activity-light`
- Title: Show terminal tab output activity
- Phase: done
- Status: done
- Priority: 1
- Depends on: none
- Started: 2026-05-09T15:36:02+08:00

## Request

Use terminal output activity for all commands as the first activity signal, and make the terminal tab green indicator turn on while output is arriving and turn off after output becomes quiet.

## Progress

- Registered active task.
- Implemented output-driven terminal tab indicators.
- Verification passed.

## Completed

- Completed: 2026-05-09T15:42:00+08:00

## Verification Plan

- `npm run typecheck`
- `npm run build`
- `git diff --check`
