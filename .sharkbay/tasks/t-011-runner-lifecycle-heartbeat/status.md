# Task Status

## Metadata

| Field | Value |
| --- | --- |
| Task ID | `t-011-runner-lifecycle-heartbeat` |
| Title | Separate runner lifecycle from harness phase |
| Priority | 1 |
| Phase | done |
| Owner Role | Controller |
| Depends On | `t-010-agent-onboarding-instructions` |
| Created | 2026-05-05 |
| Updated | 2026-05-05 |

## Goal

Separate the harness engineering lifecycle from the physical agent execution lifecycle so SharkBay can tell the difference between a task's current phase and whether an external agent is actually running, stale, idle, blocked, or waiting for a human.

## Scope

In scope:

- Define a runner lifecycle model independent from task phase.
- Decide where runner lease and heartbeat data lives in the harness files.
- Define how agents acquire, refresh, release, and mark runner state.
- Define how SharkBay reads runner state and decides what belongs in `Needs Action`.
- Preserve local-first, file-based operation without depending on a specific IDE plugin.

Out of scope:

- Building a Cursor, VS Code, or Codex IDE extension.
- Reliably introspecting another app's private agent state without cooperation.
- Starting background agents directly from SharkBay.
- Replacing the existing phase model.

## Current Gate

| Gate | Status | Notes |
| --- | --- | --- |
| Dependencies | pass | `t-010-agent-onboarding-instructions` is done. |
| Spec | pass | `spec.md` separates harness phase from runner lifecycle and defines the cooperative heartbeat requirements. |
| Design | pass | `design.md` chooses `.agent/runner.json`, freshness semantics, UI rules, and implementation slices. |
| Design review | pass | `design-review.md` found blocker=0 and major=0; two minor notes are scoped into or out of the contract. |
| Contract | pass | `contract.md` limits the first slice to read-only runner lifecycle metadata, Needs Action semantics, and focused tests. |
| Code review | pass | `code-review.md` found no blocker, major, or minor issues. |
| Verification | pass | `verification.md` records passing checks and the occupied-port dev-server evidence. |
| Docs update | pass | `docs/learnings.md`, `docs/task.md`, `AGENTS.md`, `.agent/protocol.md`, and `docs/agents.md` updated. |

## Next Action

Task complete.

## Open Questions

| Question | Blocks Phase | Owner |
| --- | --- | --- |
| Should the first implementation read runner state from `.agent/runner.json`, `state.runner`, or both? | spec | Controller |
| What heartbeat staleness threshold should SharkBay use by default? | spec | Controller |
| Should `idle + active task` appear in `Needs Action` or a separate non-urgent surface? | design | Controller |

## History

| Date | Phase | Summary |
| --- | --- | --- |
| 2026-05-05 | design_review -> contract | Design review passed with no blockers or major findings. |
| 2026-05-05 | contract -> coding | Contract accepted for the first read-only runner lifecycle slice. |
| 2026-05-05 | coding -> verification | Implemented runner reading, workflow semantics, protocol docs, and code review passed. |
| 2026-05-05 | verification -> docs_update | Final verification passed; docs update is the remaining gate. |
| 2026-05-05 | docs_update -> done | Durable docs updated and task marked done. |
| 2026-05-05 | spec -> design_review | Wrote spec and design for a `.agent/runner.json` cooperative lease/heartbeat model. |
| 2026-05-05 | intake -> spec | Opened the task from the user request after identifying that harness phase and physical agent lifecycle are currently conflated. |
