# Implementation Contract

## Done Criteria

- `TerminalPane` renders the selected project name instead of the literal `Terminal` heading.
- `ProjectDetailPane` no longer renders the top-level project name/path header.
- `NotSetupPane` no longer renders the top-level candidate name/path header.
- Task detail pages keep their task title/back control.

## Verification Methods

- Run `npm run typecheck`.
- Run `git diff --check`.
- Inspect the changed JSX to confirm the exact header removals.

## Files In Scope

- `src/renderer/App.tsx`
- Task/state documentation for `t-024-project-aware-column-headings`

## Files Out Of Scope

- `src/main/**`
- `electron/**`
- Terminal manager tests and implementation
- Scanner, harness reader, and writer modules

## Stop Conditions

- Stop before changing terminal lifecycle/session behavior.
- Stop before changing layout persistence or scan data models.
