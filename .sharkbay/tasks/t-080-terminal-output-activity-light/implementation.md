# Implementation

## Changed Files

- `src/renderer/App.tsx`
- `src/styles/app.css`

## Notes

- Added a per-tab `outputActive` renderer flag.
- Marked a tab active whenever a `terminal:data` event arrives for that session.
- Reset the activity flag after 1600 ms without output.
- Cleared activity timers on tab close, process exit, and component unmount.
- Changed the terminal tab dot so running-but-quiet tabs are dim, active-output tabs are green, and exited tabs stay gray.

## Verification

See `verification.md`.
