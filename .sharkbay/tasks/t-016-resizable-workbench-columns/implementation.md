# Implementation

## Summary

- Replaced the single detail-column resize model with persisted project-column and detail-column widths.
- Added two accessible separators:
  - Project list / task detail.
  - Task detail / terminal.
- Added pointer drag and keyboard arrow resizing for both separators.
- Clamped column widths so project list, task detail, and terminal each retain a usable minimum width.
- Kept terminal as the flexible rightmost column so it occupies all remaining space and continues to trigger the existing xterm `ResizeObserver` fit path.
- Updated responsive CSS fallback templates to include both separators.

## Files Changed

- `src/renderer/App.tsx`
- `src/styles/app.css`

## Checks

- `npm run typecheck`: passed
- `npm test`: passed
- `npm run build`: passed with the existing xterm chunk-size warning
- `git diff --check`: passed
