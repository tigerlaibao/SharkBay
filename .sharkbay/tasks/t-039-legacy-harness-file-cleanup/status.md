# Task Status

## Summary

| Field | Value |
| --- | --- |
| Task ID | `t-039-legacy-harness-file-cleanup` |
| Title | Clean up legacy root harness files after `.sharkbay` compatibility lands |
| Phase | done |
| Status | done |
| Priority | 2 |
| Depends on | `t-037-contained-sharkbay-harness-layout`, `t-038-gitignore-agent-owned-setup-guidance` |

## Goal

After contained `.sharkbay/` setup and legacy compatibility are working, design and implement an explicit cleanup/migration path for projects that still have old root-level harness files.

## Initial Scope

- Detect legacy files: `.agent/`, root `docs/`, root `tasks/`, and any old setup-seeded `.gitignore` assumptions.
- Never delete or move files silently.
- Provide a human-gated cleanup or migration flow that preserves project-owned history and refuses ambiguous conflicts.
- Record cleanup evidence in the affected project's harness files.

## Done Criteria

- Safe cleanup preconditions, conflict handling, and verification evidence are recorded.
- Cleanup did not start until contained layout compatibility was proven and `.gitignore` behavior was moved to target-agent ownership.
- Product code now exposes explicit confirmed legacy migration and does not run it silently.

## Dependency Lock

`t-037-contained-sharkbay-harness-layout` and `t-038-gitignore-agent-owned-setup-guidance` are done.

## Phase History

- 2026-05-07T11:08:00+08:00: Moved from backlog to active `spec` after compatibility review confirmed T038 is satisfied by T037 and T039 must be explicit, gated, and legacy-compatible.
- 2026-05-07T11:12:00+08:00: Recorded spec, design, and contract; advanced to `coding`.
- 2026-05-07T11:24:00+08:00: Implemented, reviewed, verified, and marked done.
