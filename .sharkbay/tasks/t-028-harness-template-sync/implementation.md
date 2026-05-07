# Implementation

## Summary

Implemented a safe harness template sync foundation:

- Added `src/main/harness-template-sync.ts`.
- Added content-hash based template versioning for version-owned files:
  - `AGENTS.md`
  - `.agent/protocol.md`
  - `.agent/quality-rules.md`
- Added `.agent/template-sync.json` metadata generation for newly installed harnesses.
- Added explicit check/update functions:
  - `checkHarnessTemplateSync`
  - `updateHarnessTemplateFiles`
- Added template drift summary data to project scan/detail results via `ProjectSummary.harnessTemplate`.
- Exposed check/update through the Electron IPC/preload bridge for later UI wiring:
  - `window.sharkBay.harness.checkTemplateSync`
  - `window.sharkBay.harness.updateTemplateFiles`
- Kept project-owned files out of sync writes: `.agent/manifest.json`, `.agent/state.json`, `.agent/queue.*`, `.agent/development.json`, `.gitignore`, `docs/**`, and `tasks/**`.

## User-Visible Behavior

Managed project scan results now include harness template drift status. New setup installs record which SharkBay template version seeded their version-owned control files. A caller can explicitly update stale version-owned harness files without overwriting project state/history.

## Safety Notes

- Repos are resolved through configured roots before checks or updates.
- Version-owned file paths are hardcoded and reject absolute paths or `..`.
- Existing symlinked target files or parent directories are rejected.
- Matching old installs without `.agent/template-sync.json` are treated as current by content.

## Required Checks

- `npm run typecheck` passed.
- `npm test -- tests/harness-template-sync.test.ts tests/template-installer.test.ts` passed.
- `npm test` passed.
- `npm run build` passed with the existing Vite chunk-size warning.
- `git diff --check` passed.

## Known Risks

- No renderer UI or automatic background scheduler is included in this slice.
- Explicit update currently overwrites version-owned file local edits; this is intentional for the version-owned file class but should be surfaced clearly before wiring a UI action.
