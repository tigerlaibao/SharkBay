# t-041-settings-terminal-resize-guard

- Title: Guard terminal resize when entering Settings
- Status: done
- Phase: done
- Priority: 1
- Depends on: none
- Opened: 2026-05-07T13:23:04+08:00
- Completed: 2026-05-07T13:26:55+08:00
- User request: "bugfix: 进入settings的时候会报错:Error invoking remote method 'terminal:resize': Error: resizing must be done using positive cols and rows"

## Scope

Fix the Settings navigation path so hidden or not-yet-measured terminal surfaces do not invoke `terminal:resize` with zero, negative, NaN, or otherwise invalid rows/cols.

## Assumptions

- The terminal backend should still reject invalid resize dimensions.
- The renderer should avoid sending invalid resize requests when terminal panes are hidden during Settings.
- No user-facing Settings workflow changes are intended.

## Done Criteria

- Entering Settings with terminal spaces mounted no longer throws the `terminal:resize` positive cols/rows error.
- Terminal resize behavior still works for visible terminal surfaces.
- Focused tests or type/build checks cover the regression path where possible.

## Verification Plan

- Inspect `terminal:resize` callers and backend validation.
- Add or update focused regression coverage for hidden/zero terminal dimensions if practical.
- Run `npm run typecheck`, focused tests if changed, and `git diff --check`.

## Outcome

Implemented renderer and backend resize guards. Verification passed:

- `npm test -- tests/renderer-workflow.test.ts tests/terminal.test.ts`
- `npm run typecheck`
- `git diff --check`
- `npm test`
- `npm run build`
