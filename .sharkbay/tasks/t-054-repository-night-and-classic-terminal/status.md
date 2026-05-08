# t-054-repository-night-and-classic-terminal

- Status: done
- Phase: done
- Priority: 1
- Depends on: none
- Started: 2026-05-08T14:19:11+08:00

## Goal

Fix the Repository panel colors in Night mode and make Classic terminal styling match the pre-T051 terminal more closely.

## Current State

- Repository fact tiles use `.fact` and still retain light-mode backgrounds in Night.
- Classic uses the old xterm core palette, but terminal chrome needs a stricter old-style override.

## Next Action

Checkpoint the completed Repository night colors and Classic terminal styling fix.

## Verification Plan

- `npm run typecheck`
- `npm run build`
- `npm test`
- `git diff --check`

## Outcome

Completed 2026-05-08T14:22:27+08:00. Verification passed.
