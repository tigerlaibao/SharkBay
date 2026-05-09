# Verification

## Commands

### `npm test -- tests/project-files.test.ts`

- Exit code: 0
- Evidence: 1 test file passed, 3 tests passed.

### `npm run typecheck`

- Exit code: 0
- Evidence: renderer and node TypeScript projects completed with no errors.

### `npm run build`

- Exit code: 0
- Evidence: `tsc -p tsconfig.node.json && vite build` completed successfully; Vite emitted the existing chunk-size warning only.

### `git diff --check`

- Exit code: 0
- Evidence: no whitespace errors reported.

### `npm test`

- Exit code: 0
- Evidence: 16 test files passed, 96 tests passed.

## Done Criteria Mapping

- Right detail tabs include `FILES`: implemented in `src/renderer/App.tsx`.
- Files tab renders a project file tree: implemented via `projects:listFiles` and `FilesDetailTab`.
- Double-click editable file opens `nano` in a new terminal tab: implemented through `TerminalPane.openFileInNano`.
- Non-editable files do not launch `nano`: enforced by editable classification and no-op open handling.
- Filesystem boundary is preserved: covered by `tests/project-files.test.ts` unsafe-root and symlink/skip checks.
