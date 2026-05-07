# Task Status

## Summary

| Field | Value |
| --- | --- |
| Task ID | `t-038-gitignore-agent-owned-setup-guidance` |
| Title | Delegate setup gitignore changes to the target project agent |
| Phase | done |
| Status | done |
| Priority | 1 |
| Depends on | `t-037-contained-sharkbay-harness-layout` |

## Goal

Stop SharkBay setup from writing, overwriting, or merging a target project's `.gitignore`. Instead, setup should leave an explicit instruction for the target project agent to decide whether and how to update `.gitignore` according to that repository's conventions.

## Initial Scope

- Remove `.gitignore` from setup-owned template writes for external projects.
- Do not silently append ignore snippets.
- Add setup-result guidance or an initial task note that asks the target agent to review runtime-only SharkBay files and update `.gitignore` if appropriate.
- Keep durable `.sharkbay/` state trackable by default; only runtime/cache subpaths should be candidates for ignore rules.

## Done Criteria

- A later spec/design defines the exact instruction surface for the target agent.
- Installer tests prove `.gitignore` is not created or changed during existing-project setup.
- New-project behavior is decided explicitly rather than inherited from the old template seed.

## Dependency Lock

Do not enter coding until `t-037-contained-sharkbay-harness-layout` is done, because the ignore guidance depends on the final contained runtime path.

## Completion

`t-037-contained-sharkbay-harness-layout` already implemented this behavior:

- Removed setup-owned `.gitignore` from bundled templates.
- Preserved existing target `.gitignore` files.
- Added initial task guidance for the target project agent to review any ignore-rule changes.

## Phase History

| Time | Transition | Notes |
| --- | --- | --- |
| 2026-05-07T11:05:00+08:00 | backlog -> done | Compatibility review found `t-038` already satisfied by `t-037`; recorded spec, design, and verification evidence. |
