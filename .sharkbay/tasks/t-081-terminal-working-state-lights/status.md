# Task Status

- Task ID: `t-081-terminal-working-state-lights`
- Title: Refine terminal working state lights
- Phase: done
- Status: done
- Priority: 1
- Depends on: none
- Started: 2026-05-09T15:57:02+08:00

## Request

Make service indicators blue so they do not conflict with terminal activity. For terminal tabs, do not light green on single input/output bursts. Require sustained output before green working state, turn green to yellow after quiet completion, keep the currently open tab from turning yellow, and clear yellow when clicked.

## Progress

- Registered active task.
- Implemented blue service indicators and sustained-output terminal working/done lights.
- Verification passed.

## Completed

- Completed: 2026-05-09T16:02:00+08:00

## Verification Plan

- `npm run typecheck`
- `npm run build`
- `git diff --check`
