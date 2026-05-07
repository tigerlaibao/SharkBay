# Design

## Backend

Add `legacy-harness-cleanup` as a focused main-process service:

- `checkLegacyHarnessCleanup({ repoPath, roots })`
  - resolves the repo through configured root authority
  - detects `.agent` and `.sharkbay`
  - returns `not_needed`, `ready`, or `blocked`
  - lists recognized moves and blockers
- `migrateLegacyHarnessToContained({ repoPath, roots })`
  - reruns the same check
  - refuses unless status is `ready`
  - creates destination parents under `.sharkbay/`
  - renames recognized files/directories
  - removes legacy containers only when empty

Use `fs.rename` instead of copy/delete so migration is local and atomic at the file/directory operation level. Preflight every planned destination before writing. Any preflight blocker stops the operation before the first move.

## Recognized Scope

The service owns only legacy harness files that T037 already knows how to read from the legacy layout. Root `docs/` is not a harness container as a whole; only known harness document names move. Root `tasks/` is not a harness container as a whole; only `_template` and task directories with `status.md` move.

## UI

Extend `ProjectSummary` with `legacyHarnessCleanup`. Project detail shows:

- blocked warning when mixed layouts or conflicts exist
- ready migration panel for legacy projects
- explicit confirmation checkbox plus button before migration

After migration, refresh the scan/detail data. No background cleanup is triggered from scanning.

## Safety

- Refuse mixed `.agent` plus `.sharkbay` layouts for this task.
- Refuse symlinked sources and symlinked legacy root containers.
- Refuse unsafe task directory names.
- Do not touch `.gitignore`.
- Do not touch SharkBay's own local harness unless the user explicitly uses the UI against this repo later.
