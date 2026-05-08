# Contract

## Scope

- Truncate long service pill label text to one line with ellipsis.
- Preserve the full label/command in the existing button title.
- Avoid changing service discovery, service execution, or terminal lifecycle behavior.

## Verification

- `npm run typecheck`
- `npm run build`
- `git diff --check`

## Gate

- Design/contract gate: blocker=0, major=0. This is a narrowly scoped presentational change.
