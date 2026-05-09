# Verification

## Commands

- `npm run typecheck`
  - Exit code: 0
  - Output excerpt: `tsc -p tsconfig.renderer.json --noEmit && tsc -p tsconfig.node.json --noEmit`
- `npm run build`
  - Exit code: 0
  - Output excerpt: `✓ built in 580ms`
- `git diff --check`
  - Exit code: 0
  - Output excerpt: no whitespace errors

## Done Criteria Mapping

- Left project rows no longer show phase, needs-action, runner, gate, or harness status pills: implemented in `ProjectTable`.
- Left project rows still show dirty/git-unknown worktree tags: existing worktree pill remains in `ProjectTable`.
- Left project rows show at most one terminal activity label, with `working` prioritized over `idle`: implemented by project-level terminal activity aggregation.
- Right Tasks tab top shows the moved project status pills in one row: implemented by `ProjectStatusStrip`.
- Typecheck, build, and diff whitespace checks pass: see commands above.

## Result

Verification passed.
