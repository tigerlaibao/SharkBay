# Implementation

## Summary

- Replaced conditional dashboard rendering with a persistent `.view-surface` wrapper that hides the dashboard instead of unmounting it.
- Wrapped Settings in its own view surface so both views share the same workspace layout contract.
- Added `isVisible` plumbing from `App` to `DashboardView`, `TerminalPane`, and `XTermSurface`.
- Made xterm active state depend on dashboard visibility so returning from Settings re-runs terminal fit/focus without discarding terminal state.
- Gated automatic new terminal creation while Settings is visible, so Settings navigation preserves existing terminals without starting new hidden sessions.

## Files Changed

- `src/renderer/App.tsx`
- `src/styles/app.css`

## Known Risks

- This preserves terminal state within the current renderer lifetime. A full app reload or window close still tears down renderer-owned xterm objects.
