# Implementation

## Changes

- Added `resources/project-icon.png` as the semantic project-avatar asset.
- Removed branded/theme-specific `resources/shark-*` and `resources/shark.png` paths from generic project-avatar discovery.
- Kept `resources/shark-morning/day/night.png` available through Electron runtime app icon wiring, not as generic project avatars.
- Added a scanner regression test proving `resources/project-icon.png` is preferred over `resources/app-icon.png` for project rows.

## Files

- `resources/project-icon.png`
- `src/main/project-icons.ts`
- `tests/scanner.test.ts`

