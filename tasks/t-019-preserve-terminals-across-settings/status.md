# t-019-preserve-terminals-across-settings

## Status

- Phase: done
- Gate: passed
- Owner: Codex
- Started: 2026-05-06
- Completed: 2026-05-06

## Goal

Keep open terminal tabs and their output state when the user opens Settings and returns to the main workbench.

## Acceptance Criteria

- Opening Settings does not unmount `DashboardView` or `TerminalPane`.
- Existing terminal spaces, tabs, xterm instances, and PTY session bindings survive Settings navigation.
- Returning from Settings makes the active xterm surface fit/focus again.
- Existing tests and build continue to pass.

## Outcome

- The dashboard now stays mounted in a hidden view surface while Settings is open.
- The terminal pane receives a visibility signal and only marks the active xterm surface visible when the dashboard is visible.
- Returning from Settings toggles the active xterm surface back on, triggering the existing fit/focus effect.
- Automatic hidden terminal creation is suppressed while Settings is visible.
- Verification passed.
