# Implementation

## Changes

- Removed the `Managed` and `Not setup` count badge rendering from `ProjectTable`.
- Moved the new-terminal `+` button out of the terminal header and into the terminal tabs row.
- Split the terminal tabs row into a scrollable tab list and a fixed right-aligned add button.
- Removed obsolete count-badge and old terminal-header action styles.

## Files

- `src/renderer/App.tsx`
- `src/styles/app.css`

## Notes

- The terminal add button keeps the existing label, title, click handler, and disabled behavior.
- The tabs row still renders when a selected project has a terminal space but no open tab, so the add button remains available at the right edge.
