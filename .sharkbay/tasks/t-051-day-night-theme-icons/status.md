# t-051-day-night-theme-icons

- Status: done
- Phase: done
- Priority: 1
- Depends on: none
- Started: 2026-05-08T13:07:29+08:00

## Goal

Use the user-provided `~/Downloads/shark_day.png` and `~/Downloads/shark_night.png` as the day and night SharkBay app icons, add matching day/night app color schemes, expose an explicit Settings control, and make terminal colors follow the selected scheme.

## Current State

- `~/Downloads/shark_day.png` and `~/Downloads/shark_night.png` exist and are 1254x1254 PNG files.
- SharkBay currently uses a single app icon and a single mostly-light app palette.
- xterm.js terminal colors are supported but currently hard-coded in `src/renderer/App.tsx`.

## Next Action

Checkpoint the completed day/night theme and icon slice.

## Verification Plan

- `npm run typecheck`
- `npm run build`
- `git diff --check`

## Outcome

Completed 2026-05-08T13:25:41+08:00. Verification passed.
