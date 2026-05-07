# Implementation Contract

## Done Criteria

- SharkBay's own harness instructions include behavioral discipline for ambiguity, simplicity, traceability, and verification mapping.
- Setup templates include equivalent guidance for new projects.
- AIBF and AIGF get equivalent guidance with local file shape preserved.
- SharkBay state, queue, task docs, and learnings are synchronized.

## Files In Scope

- `AGENTS.md`
- `.agent/protocol.md`
- `.agent/quality-rules.md`
- `.agent/queue.json`
- `.agent/queue.md`
- `.agent/runner.json`
- `.agent/state.json`
- `.agent/state.md`
- `docs/agents.md`
- `docs/task.md`
- `docs/learnings.md`
- `templates/harness/AGENTS.md`
- `templates/harness/.agent/protocol.md`
- `templates/harness/tasks/t-001-initial-task/spec.md`
- `templates/harness/tasks/t-001-initial-task/contract.md`
- `tasks/t-021-harness-behavioral-discipline/*`
- AIBF/AIGF harness instruction files as discovered.

## Files Out Of Scope

- Product runtime code under `src/`, `electron/`, or `tests/`.
- Package manifests and lockfiles.
- Secrets, deployment, and production configuration.

## Required Checks

- `git diff --check`
- JSON parse check for changed `.agent/*.json` files.
- Text scan confirming behavioral discipline language exists in SharkBay, templates, AIBF, and AIGF.

## Stop Conditions

- AIBF or AIGF lacks expected harness files in a way that makes direct editing ambiguous.
- A required write outside SharkBay is denied.
- Verification reveals contradictory instructions.

## Developer Metadata

No `.agent/development.json` change is intended.
