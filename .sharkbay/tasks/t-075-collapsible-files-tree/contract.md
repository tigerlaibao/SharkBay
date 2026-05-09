# Contract

## Scope

Update the existing Files tab tree interaction only.

## Requirements

- Keep the backend file tree unchanged.
- In the renderer, maintain per-project expanded directory state.
- Treat the project root as implicitly expanded so root-level entries show immediately.
- Render nested directories collapsed by default.
- Show `+` for collapsed directories and `-` for expanded directories.
- Directory toggle clicks must not launch `nano`.
- Editable file double-click/Enter launch behavior must continue to work.

## Verification

- Run `npm run typecheck`.
- Run `npm run build`.
- Run `git diff --check`.
