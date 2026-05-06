# Code Review

## Findings

- blocker: 0
- major: 0
- minor: 0

## Review Notes

- The Settings menu action is scoped to focusing/showing the main window and sending a renderer event; it does not perform filesystem work or bypass existing Settings behavior.
- The preload bridge exposes a subscription callback instead of generic IPC access.
- Removing the left-column controls also removes their state from project filtering, so hidden filters cannot keep affecting the list.

## Checks Reviewed

- `npm run typecheck`
- `npm test`
- `npm run build`
- `git diff --check`
