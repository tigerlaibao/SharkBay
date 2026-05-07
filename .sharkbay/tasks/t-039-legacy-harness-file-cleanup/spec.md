# Specification

## User Goal

External projects that still use the old root-level Ripple harness layout need a safe way to move harness-owned files into `.sharkbay/` after T037, without SharkBay silently deleting or moving project-owned files.

## Compatibility Requirements

- Keep T037 behavior intact: new setup writes root `AGENTS.md` plus `.sharkbay/**`; existing legacy `.agent` projects remain readable.
- Treat T038 as complete: SharkBay must not write, merge, or remove a target project's `.gitignore`; ignore decisions stay with the target project agent.
- Do not migrate this SharkBay repository as part of the product-code task.
- Do not run cleanup automatically during scan, setup, template sync, or detail reads.

## Functional Requirements

- Detect legacy migration readiness for managed projects that use `.agent/` without `.sharkbay/`.
- Surface a blocked state when both `.agent/` and `.sharkbay/` exist.
- Move only recognized harness files:
  - `.agent/manifest.json`, `.agent/state.json`, `.agent/queue.json`, `.agent/queue.md`, `.agent/state.md`, `.agent/development.json`, `.agent/protocol.md`, `.agent/quality-rules.md`, `.agent/template-sync.json`
  - root `docs/product.md`, `docs/architecture.md`, `docs/task.md`, `docs/learnings.md`
  - root `tasks/_template`
  - root `tasks/<task-id>/` only when it contains `status.md`
- Leave unrelated root `docs/` and `tasks/` entries in place.
- Keep root `AGENTS.md` in place.
- Remove `.agent/`, root `docs/`, and root `tasks/` only if they are empty after the recognized moves.
- Refuse migration if any destination path already exists or any source is a symlink.
- Expose migration through an explicit confirmed UI/API action.

## Done Criteria

- Read-only project detail exposes legacy cleanup status.
- UI presents a confirmed migration action only when safe.
- Migration moves recognized legacy harness files into `.sharkbay/` and leaves unrelated project files untouched.
- Tests cover ready, mixed-layout blocked, conflict blocked, and preservation of unrelated root docs/tasks content.
