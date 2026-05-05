# Task Status

## Metadata

| Field | Value |
| --- | --- |
| Task ID | `t-007-ripple-setup-flow` |
| Title | Design confirmation-gated Ripple setup for existing projects |
| Priority | 1 |
| Phase | done |
| Owner Role | Controller |
| Depends On | `t-006-autonomous-ux-polish` |
| Created | 2026-05-05 |
| Updated | 2026-05-05 |

## Goal

Let a not-setup project become a managed Ripple project from the Projects workbench, with explicit confirmation before SharkBay writes harness files into an existing directory.

## Scope

In scope:

- Define the write-safety and confirmation behavior for installing Ripple files into existing project directories.
- Reuse the bundled harness template without overwriting existing user files.
- Enable the not-setup project detail pane to start setup after confirmation.
- Refresh the workbench after setup so the project moves into the managed section.

Out of scope:

- Auto-filling project URL metadata.
- Running project-specific package managers or deployment commands.
- Creating remote GitHub repositories.
- Managing servers or ports.

## Current Gate

| Gate | Status | Notes |
| --- | --- | --- |
| Dependencies | pass | `t-006-autonomous-ux-polish` is done. |
| Spec | pass | User goal and safety constraints recorded in `spec.md`. |
| Design review | pass | Confirmation-gated no-overwrite design passed. |
| Contract | pass | Implementation scope and required checks recorded in `contract.md`. |
| Code review | pass | Self-review passed after preflight collision revision. |
| Verification | pass | Typecheck, targeted tests, full tests, build, and diff check passed. |
| Docs update | pass | Queue, state, and task docs updated. |

## Next Action

Open `t-008-project-authored-url-metadata` when ready to define project-authored URL metadata conventions.

## Open Questions

| Question | Blocks Phase | Owner |
| --- | --- | --- |

## History

| Date | Phase | Summary |
| --- | --- | --- |
| 2026-05-05 | backlog -> spec | Opened the confirmation-gated Ripple setup task. |
| 2026-05-05 | spec -> coding | Spec, design review, and contract passed for the no-overwrite setup flow. |
| 2026-05-05 | coding -> verification | Implemented confirmed existing-directory setup and passed code review/checks. |
| 2026-05-05 | verification -> done | Verification and docs update passed. |
