# t-033-remove-flat-side-panel-shells

## Status

- Title: Remove flat side panel shells
- Phase: done
- Status: done
- Priority: 1
- Depends on: none
- Created: 2026-05-06T23:15:16+08:00
- Updated: 2026-05-06T23:17:40+08:00
- Completed: 2026-05-06

## User Goal

Remove the remaining invisible outer panel boxes from the left project column and right detail column so their contents sit directly in the workbench grid, while preserving scrolling, sticky right detail tabs, and column resizing.

## Done Criteria

- Left project column no longer inherits `.panel` padding, border, radius, or box sizing from the removed white container.
- Right detail column no longer inherits `.panel` padding, border, radius, or box sizing from the removed white container.
- Terminal panel and both column resizers keep existing behavior.
- Right detail content continues to scroll and the top detail tabs remain sticky.
- Typecheck, build, and diff checks pass.

## Notes

- Scope is limited to renderer structure/CSS for the two side columns.

## Verification

- `npm run typecheck` passed.
- `npm run build` passed with the existing Vite chunk-size warning.
- `git diff --check` passed.
- Existing Vite server at `http://127.0.0.1:5173` returned HTTP 200.

## Checkpoint

- Committed product change as `3dd44b0` (`Remove side panel shells`).
