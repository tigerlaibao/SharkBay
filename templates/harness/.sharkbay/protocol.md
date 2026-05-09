# Ripple Controller Protocol

Read `.sharkbay/manifest.json`, `.sharkbay/state.json`, `.sharkbay/queue.json`, `.sharkbay/protocol.md`, `.sharkbay/quality-rules.md`, `.sharkbay/queue.md`, `.sharkbay/state.md`, and the active task status before advancing work.

Do not skip phase gates. Advance by one phase transition at a time, record that transition in the harness files, then continue to the next phase while the task scope and safety rules allow.

Default to autonomous forward progress. Continue across phases until the task is done or blocked.

Register new or ad-hoc work before product changes: create `.sharkbay/tasks/<task-id>/status.md`, add it to Active in `.sharkbay/queue.json` and `.sharkbay/queue.md`, and update `.sharkbay/state.json` and `.sharkbay/state.md` currentTask.

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
- Do not commit secrets, generated dependency folders, build output, or local logs.
- If a required checkpoint cannot be made, record the reason in `.sharkbay/tasks/<task-id>/status.md`.
