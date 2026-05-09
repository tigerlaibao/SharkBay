# Contract

## Scope

Change the Files tab from eager recursive listing to lazy directory listing.

## Requirements

- Add a project-relative `directoryPath` option to the file listing IPC.
- Backend returns only immediate children of the requested directory.
- Renderer loads root entries first and loads child entries when a directory is expanded.
- Show directories as expandable before their children are loaded.
- Preserve all-name visibility: no `.git`, `node_modules`, hidden-file, or build-output name filters.
- Preserve configured-root containment and symlink escape boundaries.

## Verification

- Update focused project file tests for one-level listing and directory-path listing.
- Run `npm test -- tests/project-files.test.ts`.
- Run `npm run typecheck`.
- Run `npm run build`.
- Run `git diff --check`.
