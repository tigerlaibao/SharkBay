# Implementation

## Changed Files

- `src/renderer/App.tsx`
- `src/styles/app.css`

## Notes

- Added a terminal input hook from xterm `onData` before input is sent to the PTY.
- User input clears the quiet timer and resets the output burst start for the tab, so input echo does not accumulate into the sustained-output `working` window.
- Existing yellow `done` state is not cleared by typing; it is still cleared by clicking the tab.
- Moved the `No terminal open` empty state into each terminal space's xterm content area.
- Added an empty terminal space with a normal tab row for the no-space case, so the dashed empty state sits below the tab row.

## Verification

See `verification.md`.
