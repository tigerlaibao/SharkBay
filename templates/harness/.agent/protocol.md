# Codex Controller Protocol

Read `.agent/manifest.json`, `.agent/state.json`, `.agent/queue.json`, `.agent/queue.md`, `.agent/state.md`, and the active task status before advancing work.

Do not skip phase gates. Advance by one phase transition at a time, record that transition in the harness files, then continue to the next phase while the task scope and safety rules allow.

Default to autonomous forward progress. Continue across phases until the task is done, blocked, or a real human intervention is required.

When physically working, publish runner state in optional `.agent/runner.json`:

- `running` while actively working; refresh `heartbeatAt` during long work and phase changes.
- `waiting_for_human` only when a human decision, approval, credential, or external action is required.
- `blocked` when work cannot proceed without a non-routine dependency or unavailable authority.
- `idle` when no runner is active and no human decision is being requested.

Record durable decisions, verification evidence, and task state in the harness files on disk.

## Git Checkpoint Discipline

If the project is a git repository, checkpoint commits are required.

Required checkpoints:

- After initial harness files are created or first brought under agent control.
- After each completed phase artifact or coherent implementation slice.
- After review fixes before re-entering review.
- After verification/docs updates when a task is marked `done`.

Commit rules:

- Keep commits focused on one phase or one coherent behavior change.
- Do not mix unrelated user changes into a checkpoint.
- Do not commit secrets, generated dependency folders, build output, local logs, or `.agent/runner.json`.
- If a required checkpoint cannot be made, record the reason in `tasks/<task-id>/status.md` and stop only when the reason requires human intervention.
