# Spec

## Scope

SharkBay needs a safe way to keep installed Ripple harness control files current with the tracked `templates/harness/` source in this repository.

The update problem has two different classes of files:

- Version-owned control files: files whose content should follow SharkBay's template when the template changes.
- Project-owned state/history files: files that were seeded during setup but become local project memory after installation and must not be overwritten by template refresh.

## Version-Owned Files

- `AGENTS.md`
- `.agent/protocol.md`
- `.agent/quality-rules.md`

These files are shared operating rules or template hygiene. If SharkBay commits new versions of these files, managed projects should be able to detect drift and update them.

## Project-Owned Files

- `.agent/manifest.json`
- `.agent/state.json`
- `.agent/queue.json`
- `.agent/queue.md`
- `.agent/state.md`
- `.agent/development.json`
- `.gitignore`
- `docs/**`
- `tasks/**`

These contain identity, runtime metadata, task queues, history, decisions, ignore rules, or product context. They may be seeded by the template but become project-owned immediately after installation.

## Acceptance Criteria

- SharkBay can compute the current harness template version from version-owned tracked template files.
- New installs record template sync metadata in the target project.
- Existing managed projects can be checked for current/stale/missing/modified version-owned files.
- A safe update function writes only version-owned files and sync metadata.
- Update logic rejects projects outside configured roots and symlink escapes.
- Focused tests cover fresh install metadata, stale detection, update behavior, and project-owned file preservation.

## Non-Goals

- No silent background mutation in this task.
- No bulk update across all configured projects without an explicit caller.
- No merge strategy for project-local edits to version-owned files.
- No overwrite of task, queue, state, manifest, or docs project data.

## Assumptions

- A content hash is enough to detect template freshness; it does not require network access or origin/main state.
- The UI can later call the check/update service periodically or after scans. This task builds the safe service foundation first.
- Existing projects without sync metadata can still be checked by comparing their version-owned files to the current templates.

## Blocking Questions

None.
