# Ripple Controller Protocol

Read `.sharkbay/manifest.json`, `.sharkbay/state.json`, `.sharkbay/queue.json`, `.sharkbay/protocol.md`, `.sharkbay/quality-rules.md`, `.sharkbay/queue.md`, `.sharkbay/state.md`, and the active task status before advancing work.

Do not skip phase gates. Advance by one phase transition at a time, record that transition in the harness files, then continue to the next phase while the task scope and safety rules allow.

Default to autonomous forward progress. Continue across phases until the task is done, blocked, or a real human intervention is required.

When physically working, publish runner state in optional `.sharkbay/runner.json`:

- Register new or ad-hoc work before claiming runner state: create `.sharkbay/tasks/<task-id>/status.md`, add it to Active in `.sharkbay/queue.json` and `.sharkbay/queue.md`, and update `.sharkbay/state.json` and `.sharkbay/state.md` currentTask.
- Only write `status=running` after `runner.taskId` is visible as the Active task.
- If a runner is already `running` for a task that is missing from Active queue/state, repair task registration before product code changes or set `waiting_for_human`/`blocked` with a reason.
- `running` while actively working; refresh `heartbeatAt` during long work and phase changes.
- `waiting_for_human` only when a human decision, approval, credential, or external action is required.
- `blocked` when work cannot proceed without a non-routine dependency or unavailable authority.
- `idle` when no runner is active and no human decision is being requested.

Record durable decisions, verification evidence, and task state in the harness files on disk.

## Behavioral Discipline

- Clarify material ambiguity before implementation. If the task can reasonably mean different things, record assumptions, tradeoffs, or blocking questions in the current phase artifact.
- Prefer the simplest implementation that satisfies the task contract. Do not introduce a new abstraction, configuration layer, generalized framework, or broad refactor unless it removes real duplication, reduces real risk, or is already the local pattern.
- Keep changes traceable. Every changed file should connect to the user goal, task contract, review finding, or verification failure; unrelated cleanup belongs in a separate task.
- Bind goals to verification early. Contract done criteria should name the command, test, script, manual check, or evidence type that will prove each criterion.
- Simplicity does not weaken safety. Required guards for filesystem containment, IPC trust boundaries, schema validation, data integrity, credentials, billing, production data, and destructive operations remain mandatory even when they add complexity.

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
- Do not commit secrets, generated dependency folders, build output, local logs, or `.sharkbay/runner.json`.
- If a required checkpoint cannot be made, record the reason in `.sharkbay/tasks/<task-id>/status.md` and stop only when the reason requires human intervention.
