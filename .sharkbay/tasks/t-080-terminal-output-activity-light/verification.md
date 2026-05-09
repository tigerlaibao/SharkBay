# Verification

## Commands

- `npm run typecheck`
  - Exit code: 0
  - Output excerpt: `tsc -p tsconfig.renderer.json --noEmit && tsc -p tsconfig.node.json --noEmit`
- `git diff --check`
  - Exit code: 0
  - Output excerpt: no whitespace errors
- `npm run build`
  - Exit code: 0
  - Output excerpt: `✓ built in 511ms`

## Done Criteria Mapping

- Any terminal tab receiving output shows an active green indicator: implemented through `terminal:data` handling and `outputActive`.
- A running tab with no recent output shows an inactive indicator: implemented through the 1600 ms quiet timeout.
- An exited tab still shows the exited/gray indicator: implemented by clearing activity on terminal exit and preserving `is-exited` styling.
- Typecheck, build, and diff whitespace checks pass: see commands above.

## Result

Verification passed.
