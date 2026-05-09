# Verification

## Commands

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

- Files tab remains active on project switch: `ProjectDetailPane` preserves `files` in the project-id reset effect.
- Old tree clears immediately: `FilesDetailTab` sets `files: []` when a new load starts.
- File/folder row icons: CSS-only `.project-file-glyph` styles.
- Files tab icon: CSS-only `.detail-tab-icon.is-files`.
- Existing expansion/nano behavior preserved: no backend or terminal launch changes.
