# Implementation

## Summary

Added visible UI for harness template drift.

## Changes

- Project rows now show `harness stale` or `harness missing` pills when scan summaries report drift.
- Selected project detail now shows a top-level harness sync panel above the tab strip.
- The panel lists affected version-owned files and requires confirmation before calling `harness.updateTemplateFiles`.
- Successful sync shows a toast and refreshes project scan/detail state.

## Checks Run

- `npm run typecheck`
- `npm test`
- `npm run build`
- `git diff --check`

## Known Risks

- This is a per-project action. Bulk update remains out of scope.
