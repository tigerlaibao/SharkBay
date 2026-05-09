# AGENTS.md

This repository uses a tool-neutral Ripple harness.

## Start Here

Before starting any task, use `.sharkbay/` as the harness directory when it exists. If this project still uses the legacy layout, use `.agent/` for control files, root `docs/` for docs, and root `tasks/` for task artifacts.

For the contained layout, read:

1. `.sharkbay/manifest.json` - machine-readable repository identity
2. `.sharkbay/state.json` - machine-readable current state
3. `.sharkbay/queue.json` - machine-readable task queue
4. `.sharkbay/protocol.md` - controller workflow and phase rules
5. `.sharkbay/quality-rules.md` - review and verification gates
6. `.sharkbay/queue.md` - human-readable active task queue
7. `.sharkbay/state.md` - human-readable repo-level state
8. `.sharkbay/docs/product.md` - product context
9. `.sharkbay/docs/architecture.md` - technical structure and boundaries
10. `.sharkbay/docs/task.md` - human-readable task list
11. `.sharkbay/docs/learnings.md` - durable lessons from prior work

For the active task, also read `.sharkbay/tasks/<task-id>/status.md` and `.sharkbay/tasks/<task-id>/contract.md` when the current phase has an implementation contract. In legacy projects, read `tasks/<task-id>/status.md` and `tasks/<task-id>/contract.md` instead.

## Operating Rule

Do not rely on chat memory as the source of truth. If a decision, task state, test result, review finding, or verification result matters, write it to the appropriate harness file.

## Behavioral Discipline

- If a request is materially ambiguous, record assumptions, tradeoffs, and blocking questions before implementation.
- Prefer the simplest implementation that satisfies the task contract; add abstraction only when it removes real duplication or risk.
- Keep every code or documentation change traceable to the user goal, task contract, review finding, or verification failure.
- Map each done criterion to a concrete verification check before marking work complete.
- Simplicity never overrides explicit safety, data integrity, IPC, filesystem, or credential boundaries.

## Default Workflow

When asked to continue or advance work:

1. Read `.sharkbay/protocol.md` or legacy `.agent/protocol.md`.
2. Read `.sharkbay/queue.json` and `.sharkbay/queue.md`, or legacy `.agent/queue.json` and `.agent/queue.md`, then choose the highest-priority active task.
3. Check dependency locks before advancing into coding.
4. Read `.sharkbay/tasks/<task-id>/status.md` or legacy `tasks/<task-id>/status.md`.
5. If the work is new or ad hoc, register it before product changes: create `.sharkbay/tasks/<task-id>/status.md`, add it to Active in `.sharkbay/queue.json` and `.sharkbay/queue.md`, and update `.sharkbay/state.json` and `.sharkbay/state.md` currentTask. In legacy projects, use the matching `.agent/` and root `tasks/` paths.
6. Execute the next required phase transition without skipping gates.
7. Write or update the phase artifact.
8. Update `.sharkbay/tasks/<task-id>/status.md`, or legacy `tasks/<task-id>/status.md`.
9. Update `.sharkbay/state.json` and `.sharkbay/state.md` if repo-level state changed. In legacy projects, use `.agent/state.json` and `.agent/state.md`.
10. Keep `.sharkbay/queue.json` and `.sharkbay/queue.md` in sync. In legacy projects, use `.agent/queue.json` and `.agent/queue.md`.
11. Make a focused checkpoint commit for completed phase work when the repository is a git repo.
12. Continue autonomously across phases until the task is done or blocked.

## Quality Gate

Design and code pass only when the relevant review and verification gates in `.sharkbay/protocol.md` or legacy `.agent/protocol.md`, the task contract, and the phase artifacts are satisfied. Verification must leave evidence: commands, exit codes, output excerpts, screenshots, traces, or validation scripts as appropriate.

## Safety

Stop and ask before destructive changes, significant scope expansion, architecture changes beyond the approved design, skipped required verification, secrets or credentials, billing, production data, merging, releasing, deploying, or publishing.

Preserve existing project files. Do not overwrite or merge local instruction files such as `AGENTS.md` unless the user explicitly approves that work in scope.

## Git Checkpoints

If this is a git repository, do not leave completed harness initialization or phase work uncommitted.

Commit after:

- Initial harness setup files are created or first brought under agent control.
- Each completed phase artifact or coherent implementation slice.
- Review fixes before re-entering review.
- Verification/docs updates when a task is marked done.

Keep commits focused. Do not mix unrelated user changes into a harness checkpoint. If a checkpoint cannot be made, record the reason in `.sharkbay/tasks/<task-id>/status.md` or legacy `tasks/<task-id>/status.md` before stopping.
