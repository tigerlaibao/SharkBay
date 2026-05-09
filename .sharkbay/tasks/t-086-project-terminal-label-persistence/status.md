# Task Status

- Task ID: `t-086-project-terminal-label-persistence`
- Title: Persist project terminal labels across selection
- Phase: done
- Status: done
- Priority: 1
- Depends on: none
- Started: 2026-05-09T17:01:21+08:00

## Request

Fix two T083 follow-up bugs:

1. The left project list `working` label only appears for the currently selected project; when another project is selected, the original project can still be working but its label disappears.
2. The `idle` label should be yellow.

## Progress

- Registered active regression task.
- Moving directly to a narrow coding phase because the scope is a small UI state/style correction.
- Filtered xterm focus in/out sequences so clicking another project does not reset the previous terminal tab's output observation.
- Made project-row terminal activity lookup tolerate candidate id, managed project id, and project path keys.
- Restored yellow idle styling across base and Night themes.
- Verification passed.

## Verification Plan

- Inspect terminal state aggregation so labels are keyed by project, not current selection.
- Add or update focused tests if the existing renderer tests cover project list labels.
- `npm run typecheck`
- `npm run build`
- `git diff --check`

## Completed

2026-05-09T17:04:44+08:00
