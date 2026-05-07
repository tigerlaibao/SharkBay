# Code Review

## Findings

- blocker: 0
- major: 0
- minor: 0

## Review Notes

- The fix is scoped to read-only task detail display and artifact-missing handling.
- Missing artifact markdown remains represented as `null`, preserving existing artifact shape.
- Non-missing read errors are still recorded in harness errors.
- Renderer display uses queue metadata already present in `ProjectDetail`, with no new IPC or filesystem authority.

## Result

Pass.
