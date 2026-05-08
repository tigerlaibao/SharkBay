# t-053-classic-theme-and-night-panels

- Status: done
- Phase: done
- Priority: 1
- Depends on: none
- Started: 2026-05-08T14:05:36+08:00

## Goal

Add a selectable Classic theme matching the pre-T051 layout mood, and finish night-mode panel coverage for Decisions and Git.

## Current State

- Day and Night themes exist.
- Night mode still has light-colored panels in Decisions and Git content.
- The pre-T051 look, with light side/detail columns and a dark terminal column, is not selectable after T052.

## Next Action

Checkpoint the completed Classic theme and night panel styling fixes.

## Verification Plan

- `npm run typecheck`
- `npm run build`
- `npm test`
- `git diff --check`

## Outcome

Completed 2026-05-08T14:08:39+08:00. Verification passed.
