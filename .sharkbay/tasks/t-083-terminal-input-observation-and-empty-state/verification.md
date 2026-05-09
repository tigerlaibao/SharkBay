# Verification

## Commands

- `npm run typecheck`
  - Exit code: 0
  - Output excerpt: `tsc -p tsconfig.renderer.json --noEmit && tsc -p tsconfig.node.json --noEmit`
- `npm run build`
  - Exit code: 0
  - Output excerpt: `✓ built in 524ms`
- `git diff --check`
  - Exit code: 0
  - Output excerpt: no whitespace errors

## Done Criteria Mapping

- Continuous user input does not cause a tab to become `working`: input now resets the output observation window and quiet timer.
- Output after user input starts a fresh observation window: output burst start is reset on input and recreated on later output.
- The empty terminal message does not overlap or intrude into the terminal tab row: empty state now renders inside the xterm content area below a reserved tab row.
- Typecheck, build, and diff whitespace checks pass: see commands above.

## Result

Verification passed.
