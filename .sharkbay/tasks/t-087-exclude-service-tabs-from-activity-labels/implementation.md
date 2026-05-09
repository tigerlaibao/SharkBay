# Implementation

## Changed Files

- `src/renderer/App.tsx`
- `src/renderer/workflow.ts`
- `tests/renderer-workflow.test.ts`

## Notes

- Added `projectTerminalActivityStates` to centralize project-row `working` / `idle` aggregation.
- The helper filters out tabs whose session has a `service` payload before computing project-level terminal activity.
- Non-service tabs still produce `working` first, then `idle` when no non-service tab is working and at least one non-service tab is done.
- Service running indicators are unchanged because they still use the separate service-tab scan in `TerminalPane`.

## Verification

See `verification.md`.
