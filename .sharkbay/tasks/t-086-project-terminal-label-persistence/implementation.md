# Implementation

## Changed Files

- `src/renderer/App.tsx`
- `src/renderer/workflow.ts`
- `src/styles/app.css`
- `tests/renderer-workflow.test.ts`

## Notes

- Added `shouldResetTerminalObservationForInput` so xterm focus in/out control sequences (`ESC [ I` and `ESC [ O`) are still sent to the PTY but no longer reset the terminal output observation window.
- Added `terminalActivityForCandidate` so left project rows can resolve terminal labels by candidate id, managed project id, or project path.
- Removed the managed-project-only gate around terminal activity labels so terminal labels can render whenever a candidate has terminal activity.
- Restored `idle` terminal activity pill styling to the yellow/done treatment in base and Night themes.

## Verification

See `verification.md`.
