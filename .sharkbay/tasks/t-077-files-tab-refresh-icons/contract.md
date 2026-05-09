# Contract

## Scope

Improve the existing Files tab interaction and presentation.

## Requirements

- Preserve the active Files tab while switching selected projects.
- Clear old file tree state immediately when loading a different project.
- Add subtle file/folder row icons without adding a dependency.
- Add a subtle Files tab icon without changing tab semantics.
- Keep plus/minus expansion controls and editable file nano launch behavior.

## Verification

- Run `npm run typecheck`.
- Run `npm run build`.
- Run `git diff --check`.
- Run full tests if changes are broader than static UI.
