# AGENTS.md

This repository uses a Codex-oriented engineering harness.

## Start Here

Before starting any task, read:

1. `.agent/manifest.json` - machine-readable repository identity
2. `.agent/state.json` - machine-readable current state
3. `.agent/queue.json` - machine-readable task queue
4. `.agent/protocol.md` - controller workflow and phase rules
5. `.agent/runner.json` - optional cooperative runner lifecycle and heartbeat
6. `.agent/queue.md` - human-readable active task queue
7. `.agent/state.md` - human-readable repo-level state
8. `docs/product.md` - product context
9. `docs/architecture.md` - technical structure and boundaries
10. `docs/task.md` - human-readable task list
11. `docs/learnings.md` - durable lessons from prior work

## Operating Rule

Do not rely on chat memory as the source of truth. If a decision, task state, test result, or review finding matters, write it to the appropriate file.

## Default Workflow

When the user asks to continue or advance work:

1. Read `.agent/protocol.md`.
2. Read `.agent/queue.json` and `.agent/queue.md`, then choose the highest-priority active task.
3. Check dependency locks before advancing the task.
4. Read `tasks/<task-id>/status.md`.
5. Write or refresh `.agent/runner.json` with `status=running` while you are actively working.
6. Execute the needed phase transitions autonomously while scope and stop conditions allow.
7. Write or update the phase artifact.
8. Update `tasks/<task-id>/status.md`.
9. Update `.agent/state.json` and `.agent/state.md` if repo-level state changed.
10. Keep `.agent/queue.json` and `.agent/queue.md` in sync.
11. Set `.agent/runner.json` to `waiting_for_human`, `blocked`, or `idle` when work stops.

## Quality Gate

Design and code do not pass because they "look fine." They pass only when the relevant review and verification gates in `.agent/quality-rules.md` are satisfied.
