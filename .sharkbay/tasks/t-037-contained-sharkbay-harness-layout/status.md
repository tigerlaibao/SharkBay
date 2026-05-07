# Task Status

## Summary

| Field | Value |
| --- | --- |
| Task ID | `t-037-contained-sharkbay-harness-layout` |
| Title | Move new harness installs into a contained `.sharkbay` layout |
| Phase | done |
| Status | done |
| Priority | 1 |
| Depends on | none |

## Goal

Reduce SharkBay's footprint in external projects by making new Ripple harness installs use only a root `AGENTS.md` plus a contained `.sharkbay/` directory for harness state, docs, tasks, protocol files, sync metadata, and runtime metadata.

## Scope Notes

- Keep `AGENTS.md` at the project root as the agent entrypoint.
- Move new install templates from scattered root `.agent/`, `docs/`, and `tasks/` paths into `.sharkbay/`.
- Preserve read compatibility with existing projects that already use `.agent/`, root `docs/`, and root `tasks/`.
- Do not clean up old installed files in this task; cleanup is deferred to `t-039-legacy-harness-file-cleanup`.
- Do not change `.gitignore` behavior here beyond avoiding assumptions that SharkBay can own project ignore rules; detailed `.gitignore` setup guidance is deferred to `t-038-gitignore-agent-owned-setup-guidance`.

## Done Criteria

- A spec records the target `.sharkbay/` layout, compatibility strategy, ownership classes, and migration risks.
- Follow-up tasks for `.gitignore` delegation and legacy cleanup are registered in queue and docs.
- Current repo harness state points at this task as Active.

## Verification Plan

- `jq empty .agent/queue.json .agent/state.json .agent/runner.json`
- Inspect `.agent/queue.md`, `.agent/state.md`, `docs/task.md`, and this task directory for matching task IDs and phases.

## Checkpoint

This repository's local dogfood harness files are intentionally ignored by the public Git repository, so this task registration cannot be checkpoint-committed without reversing the public harness cleanup policy. Record future product-code changes in normal tracked commits when implementation begins.

## Registration Evidence

| Command | Exit | Evidence |
| --- | ---: | --- |
| `jq empty .agent/queue.json .agent/state.json .agent/runner.json` | 0 | Harness JSON parsed successfully. |
| `rg -n "t-037-contained|t-038-gitignore|t-039-legacy|\\.sharkbay|gitignore" .agent/queue.md .agent/state.md docs/task.md tasks/t-037-contained-sharkbay-harness-layout/status.md tasks/t-037-contained-sharkbay-harness-layout/spec.md tasks/t-038-gitignore-agent-owned-setup-guidance/status.md tasks/t-039-legacy-harness-file-cleanup/status.md` | 0 | Task IDs, `.sharkbay` layout notes, `.gitignore` delegation, and legacy cleanup references are present in queue, state, docs, and task artifacts. |
| `git status --short --ignored .agent docs/task.md tasks` | 0 | Output shows `!! .agent/`, `!! docs/task.md`, and `!! tasks/`, confirming these dogfood harness files are ignored and not commit candidates. |

## Preflight Review

See `preflight-review.md`. Gate decision: do not begin with a direct template move or self-harness migration. First coding slice must add layout resolution and dual-layout compatibility so SharkBay's own legacy dogfood harness remains readable while new installs can move toward `.sharkbay/`.

## Implementation Summary

Implemented contained `.sharkbay/` setup and dual-layout compatibility. New installs now use root `AGENTS.md` plus `.sharkbay/**`, setup no longer writes `.gitignore`, and legacy projects remain readable/writable.

## Phase History

| Time | Transition | Notes |
| --- | --- | --- |
| 2026-05-07T10:55:00+08:00 | verification -> done | Verification passed; task marked done. |
| 2026-05-07T10:54:00+08:00 | code_review -> verification | Code review passed with blocker=0 and major=0. |
| 2026-05-07T10:53:00+08:00 | coding -> code_review | Implemented contained setup, layout-aware reader/writer/sync/prompt behavior, docs, and tests. |
| 2026-05-07T10:47:00+08:00 | contract -> coding | Design and contract recorded; implementation may start with compatibility infrastructure. |
| 2026-05-07T10:46:00+08:00 | design_review -> contract | Design review passed with blocker=0 and major=0. |
| 2026-05-07T10:45:00+08:00 | design -> design_review | Wrote a compatibility-first design. |
| 2026-05-07T10:44:00+08:00 | spec -> design | Advanced after preflight review clarified required implementation order. |
| 2026-05-07T10:39:00+08:00 | spec preflight review | Recorded blockers and implementation order for safe `.sharkbay` compatibility without breaking SharkBay's own legacy local harness. |
| 2026-05-07T10:28:00+08:00 | opened -> spec | Registered minimal-intrusion harness layout work and queued follow-up `.gitignore` and legacy cleanup tasks. |
