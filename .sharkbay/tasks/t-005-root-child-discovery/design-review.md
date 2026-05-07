# Design Review

## Summary

Design review passed.

The design keeps the scanner/API change additive by returning `candidates` alongside the existing `projects` result. It preserves current managed project scanning and avoids calling managed-project readers on ordinary folders.

## Findings

| Severity | File | Finding | Required Change |
| --- | --- | --- | --- |
| note | `design.md` | Candidate status originally included `unavailable`, but unavailable roots are already represented by `RootScanResult`. | Fixed: candidate status is now only `managed` or `not_setup`. |

## Gate Result

| Severity | Count |
| --- | --- |
| blocker | 0 |
| major | 0 |
| minor | 0 |
| note | 1 |

## Decision

- [x] Pass
- [ ] Revise
