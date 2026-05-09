# Implementation

## Completed

- Removed the Files tab backend's name-based skip list for `.git`, `node_modules`, build output, and other generated/heavy directories.
- Kept hidden files and hidden directories visible in the returned tree.
- Kept `.env` and `.env.*` files classified as editable.
- Changed symlink handling so symlink entries are visible instead of skipped.
- Preserved safety by not recursively listing or marking editable any symlink target that resolves outside the selected project/configured-root boundary.
- Updated focused project file tests to prove `.git`, `node_modules`, `dist`, `.env`, and symlink entries are visible.

## Changed Files

- `src/main/project-files.ts`
- `tests/project-files.test.ts`
- `.sharkbay/docs/architecture.md`
- `.sharkbay/docs/learnings.md`
- `.sharkbay/docs/task.md`
