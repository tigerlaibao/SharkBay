# Implementation

## Changed Files

- `src/renderer/App.tsx`
- `src/styles/app.css`

## Notes

- Added project-level terminal activity aggregation from terminal tab states.
- Left project rows now show at most one terminal activity label:
  - `working` when any tab for the project is working
  - `idle` when no tab is working and at least one tab is in the yellow done/quiet state
- Left project rows keep the dirty/git-unknown worktree pill.
- Removed phase, needs-action, runner, gate, and harness status pills from left project rows.
- Added a one-row project status strip at the top of the right-column Tasks tab.

## Verification

See `verification.md`.
