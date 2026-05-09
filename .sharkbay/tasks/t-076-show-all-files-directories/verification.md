# Verification

## Commands

### `npm test -- tests/project-files.test.ts`

- Exit code: 0
- Evidence: 1 test file passed, 3 tests passed.

### `npm run typecheck`

- Exit code: 0
- Evidence: renderer and node TypeScript projects completed with no errors.

### `git diff --check`

- Exit code: 0
- Evidence: no whitespace errors reported.

### `npm run build`

- Exit code: 0
- Evidence: `tsc -p tsconfig.node.json && vite build` completed successfully; Vite emitted the existing chunk-size warning only.

### `npm test`

- Exit code: 0
- Evidence: 16 test files passed, 96 tests passed.

## Done Criteria Mapping

- `.git`, `node_modules`, build output, hidden files, and `.env` are included: covered by `tests/project-files.test.ts`.
- No filename or directory-name skip list remains: removed from `src/main/project-files.ts`.
- Configured-root safety preserved: existing containment checks remain; symlink escape test verifies outside symlink entries are visible but non-editable/unexpanded.
