# Implementation

## Changes

- Lifted running service project ids from `TerminalPane` into `DashboardView`.
- Passed running service state to project tables.
- Rendered a small green dot before a project name when that candidate has a running service-bound tab.
- Added theme-aware dot styling while preserving project row layout.

## Files

- `src/renderer/App.tsx`
- `src/styles/app.css`
