# Contract

## Scope

- Ensure the service status dot remains visible inside truncated service pills.
- Keep label truncation behavior.
- Do not change service discovery, service execution, or terminal lifecycle behavior.

## Verification

- `npm run typecheck`
- `npm run build`
- `git diff --check`

## Gate

- Design/contract gate: blocker=0, major=0. This is a narrowly scoped CSS fix.
