# AGENTS.md

This repository can use a local Codex-oriented engineering harness while it is being dogfooded in SharkBay. The public source tree does not track this repository's root `.agent/`, root `tasks/`, `docs/task.md`, or `docs/learnings.md` runtime/history files; those are local project state.

## Start Here

Before starting any task, first check whether local harness files exist. If they do, read:

1. `.agent/manifest.json` - machine-readable repository identity
2. `.agent/state.json` - machine-readable current state
3. `.agent/queue.json` - machine-readable task queue
4. `.agent/protocol.md` - controller workflow and phase rules
5. `.agent/quality-rules.md` - review and verification gates
6. `.agent/runner.json` - optional cooperative runner lifecycle and heartbeat
7. `.agent/queue.md` - human-readable active task queue
8. `.agent/state.md` - human-readable repo-level state
9. `docs/product.md` - product context
10. `docs/architecture.md` - technical structure and boundaries
11. `docs/task.md` - human-readable task list
12. `docs/learnings.md` - durable lessons from prior work

If those local harness files are absent in a fresh clone, use the public project files instead:

1. `README.md` - project overview and development commands
2. `docs/product.md` - product context
3. `docs/architecture.md` - technical structure and boundaries
4. `docs/agents.md` - assistant guidance for this public repository
5. `templates/harness/` - canonical Ripple harness template installed into managed projects

## Operating Rule

Do not rely on chat memory as the source of truth. If the local harness exists and a decision, task state, test result, or review finding matters, write it to the appropriate local harness file. For ordinary public-repo maintenance without local harness state, keep durable user-facing decisions in public docs only when they are relevant to future users.

## Behavioral Discipline

- If a request is materially ambiguous, record assumptions, tradeoffs, and blocking questions before implementation.
- Prefer the simplest implementation that satisfies the task contract; add abstraction only when it removes real duplication or risk.
- Keep every code or documentation change traceable to the user goal, task contract, review finding, or verification failure.
- Map each done criterion to a concrete verification check before marking work complete.
- Simplicity never overrides explicit safety, data integrity, IPC, filesystem, or credential boundaries.

## Default Workflow

When the user asks to continue or advance harness-managed work and local harness files exist:

1. Read `.agent/protocol.md`.
2. Read `.agent/queue.json` and `.agent/queue.md`, then choose the highest-priority active task.
3. Check dependency locks before advancing the task.
4. Read `tasks/<task-id>/status.md`.
5. If the work is new or ad hoc, register it before claiming runner state: create `tasks/<task-id>/status.md`, add it to Active in `.agent/queue.json` and `.agent/queue.md`, and update `.agent/state.json` and `.agent/state.md` currentTask.
6. Write or refresh `.agent/runner.json` with `status=running` only after `runner.taskId` is visible as the Active task.
7. Execute the needed phase transitions autonomously while scope and stop conditions allow.
8. Write or update the phase artifact.
9. Update `tasks/<task-id>/status.md`.
10. Update `.agent/state.json` and `.agent/state.md` if repo-level state changed.
11. Keep `.agent/queue.json` and `.agent/queue.md` in sync.
12. Set `.agent/runner.json` to `waiting_for_human`, `blocked`, or `idle` when work stops.

When local harness files are absent, do not recreate SharkBay's private work history automatically. Work directly from the user's request, public docs, and the codebase.

## Quality Gate

Design and code do not pass because they "look fine." When local harness gates exist, satisfy `.agent/quality-rules.md`; otherwise use the same standard directly: scope clarity, focused implementation, review for regressions, and concrete verification evidence.
