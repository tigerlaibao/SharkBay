# Contract

## Scope

- Remove the fallback/bundled Shark project avatar image scaling override.
- Restore project avatar images to the base 100% width and height behavior.
- Preserve the Night-mode fallback icon color/filter and chip styling.

## Verification

- Source check confirms no `108%` avatar scale remains.
- `npm run typecheck`
- `npm test`
- `npm run build`
- `git diff --check`

