# AGENTS.md

This repository uses a Codex-oriented Ripple harness.

## Start Here

Before starting any task, read:

1. `.agent/manifest.json` - machine-readable repository identity
2. `.agent/state.json` - machine-readable current state
3. `.agent/queue.json` - machine-readable task queue
4. `.agent/protocol.md` - controller workflow and phase rules
5. `.agent/quality-rules.md` - review and verification gates
6. `.agent/runner.json` - optional local runner lifecycle and heartbeat
7. `.agent/queue.md` - human-readable active task queue
8. `.agent/state.md` - human-readable repo-level state
9. `docs/product.md` - product context
10. `docs/architecture.md` - technical structure and boundaries
11. `docs/task.md` - human-readable task list
12. `docs/learnings.md` - durable lessons from prior work

For the active task, also read `tasks/<task-id>/status.md` and `tasks/<task-id>/contract.md` when the current phase has an implementation contract.

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

1. Read `.agent/protocol.md`.
2. Read `.agent/queue.json` and `.agent/queue.md`, then choose the highest-priority active task.
3. Check dependency locks before advancing into coding.
4. Read `tasks/<task-id>/status.md`.
5. Write or refresh `.agent/runner.json` with `status=running` while physically working.
6. Execute the next required phase transition without skipping gates.
7. Write or update the phase artifact.
8. Update `tasks/<task-id>/status.md`.
9. Update `.agent/state.json` and `.agent/state.md` if repo-level state changed.
10. Keep `.agent/queue.json` and `.agent/queue.md` in sync.
11. Make a focused checkpoint commit for completed phase work when the repository is a git repo.
12. Continue autonomously across phases until the task is done, blocked, or the protocol requires human intervention.
13. Set `.agent/runner.json` to `waiting_for_human`, `blocked`, or `idle` when work stops.

## Quality Gate

Design and code pass only when the relevant review and verification gates in `.agent/protocol.md`, the task contract, and the phase artifacts are satisfied. Verification must leave evidence: commands, exit codes, output excerpts, screenshots, traces, or validation scripts as appropriate.

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

Keep commits focused. Do not mix unrelated user changes into a harness checkpoint. If a checkpoint cannot be made, record the reason in `tasks/<task-id>/status.md` before stopping.
