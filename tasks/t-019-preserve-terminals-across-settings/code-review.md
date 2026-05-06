# Code Review

## Findings

- blocker: 0
- major: 0
- minor: 0

## Review Notes

- The fix keeps state ownership inside `TerminalPane` but prevents the component from unmounting during Settings navigation.
- Hidden dashboard content uses `display: none`, so it is not interactable while Settings is visible.
- The active xterm surface toggles with dashboard visibility, which reuses the existing fit/focus effect on return.
- Automatic terminal creation waits until the dashboard is visible, while already-open sessions remain mounted and subscribed.

## Checks Reviewed

- `npm run typecheck`
- `npm test`
- `npm run build`
- `git diff --check`
