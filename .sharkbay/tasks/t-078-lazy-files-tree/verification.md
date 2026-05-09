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

- Initial Files tab reads only root directory: backend returns immediate children only; focused test asserts `src`, `.git`, and `node_modules` children are initially `undefined`.
- Expanding a directory loads on demand: renderer calls `listProjectFiles(detail, item.path)` and focused tests cover `directoryPath`.
- No directory/file hidden by name: no skip list was reintroduced.
- Plus/minus, icons, project switching, and nano-open behavior remain intact: renderer changes are additive around existing controls.
