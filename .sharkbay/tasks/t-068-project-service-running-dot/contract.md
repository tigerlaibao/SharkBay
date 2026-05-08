# Contract

## Scope

- Track which project candidates have running service-bound terminal tabs.
- Show a small green dot before the project name in left project rows for those projects.
- Remove the dot when the service tab exits or is stopped.

## Non-Goals

- No changes to service discovery, service command selection, terminal process management, or project scanning.

## Verification

- `npm run typecheck`
- `npm run build`
- `git diff --check`

## Gate

- Design/contract gate: blocker=0, major=0. Scope is limited to renderer state and CSS.
