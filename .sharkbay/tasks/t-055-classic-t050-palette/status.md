# t-055-classic-t050-palette

- Status: done
- Phase: done
- Priority: 1
- Depends on: none
- Started: 2026-05-08T14:25:59+08:00

## Goal

Make Classic restore the T050-before-theme-work color baseline rather than approximate it.

## Current State

- Classic exists.
- Classic terminal chrome is close but still does not visually match the T050 baseline.
- Classic xterm theme only defines the four colors that T050 set, which can allow ANSI colors from other themes to remain after switching.

## Next Action

Checkpoint the completed Classic T050 palette restoration.

## Verification Plan

- `npm run typecheck`
- `npm run build`
- `npm test`
- `git diff --check`

## Outcome

Completed 2026-05-08T14:29:08+08:00. Verification passed.
