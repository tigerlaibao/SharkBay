# t-052-theme-icon-polish

- Status: done
- Phase: done
- Priority: 1
- Depends on: none
- Started: 2026-05-08T13:46:47+08:00

## Goal

Fix day/night icon shape and theme palette issues reported after T051.

## Current State

- Electron dev icon uses the day/night PNG directly, so square PNG corners show instead of macOS-style rounded app icon alpha.
- Day mode still has a dark terminal container while the terminal itself became too white.
- Night mode is too blue and leaves some project-list/detail-tab surfaces in light-mode styling.
- The original terminal palette is a better night-mode baseline.

## Next Action

Checkpoint the completed icon shape and theme polish.

## Verification Plan

- `file` and `sips` checks for rounded icon PNG/ICNS alpha.
- `npm run typecheck`
- `npm run build`
- `npm test`
- `npm run pack`
- `git diff --check`

## Outcome

Completed 2026-05-08T13:51:50+08:00. Verification passed.
