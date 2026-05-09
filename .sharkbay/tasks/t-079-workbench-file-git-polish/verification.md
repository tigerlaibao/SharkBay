# Verification

## Commands

- `command -v vim`
  - Exit code: 0
  - Output excerpt: `/opt/homebrew/bin/vim`
- `npm test -- tests/git.test.ts tests/project-files.test.ts`
  - Exit code: 0
  - Output excerpt: `Test Files 2 passed (2); Tests 4 passed (4)`
- `npm run typecheck`
  - Exit code: 0
  - Output excerpt: `tsc -p tsconfig.renderer.json --noEmit && tsc -p tsconfig.node.json --noEmit`
- `npm run build`
  - Exit code: 0
  - Output excerpt: `✓ built in 538ms`; Vite emitted the existing chunk-size warning.
- `npm test`
  - Exit code: 0
  - Output excerpt: `Test Files 17 passed (17); Tests 97 passed (97)`
- `git diff --check`
  - Exit code: 0
  - Output excerpt: no whitespace errors.
- Harness JSON parse check
  - Exit code: 0
  - Output excerpt: `json ok`

## Result

All done criteria passed.

