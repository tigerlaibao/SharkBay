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

- Direct root children visible by default: root `state.files` is always rendered.
- Nested contents hidden by default: directory children render only when explicitly expanded.
- Directory rows show `+`/`-`: implemented in `ProjectFileTreeItemRow`.
- Toggle control does not launch `nano`: toggle button calls only `onToggleDirectory`.
- Editable file behavior preserved: file button still calls `onOpenFile` on double-click/Enter.
