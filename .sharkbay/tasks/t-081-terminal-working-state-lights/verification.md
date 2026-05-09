# Verification

## Commands

- `npm run typecheck`
  - Exit code: 0
  - Output excerpt: `tsc -p tsconfig.renderer.json --noEmit && tsc -p tsconfig.node.json --noEmit`
- `npm run build`
  - Exit code: 0
  - Output excerpt: `✓ built in 519ms`
- `git diff --check`
  - Exit code: 0
  - Output excerpt: no whitespace errors

## Done Criteria Mapping

- Service running indicators are blue across themes: implemented in `.project-service-dot` and `.service-pill.is-running .service-dot` base/night/morning styles.
- A brief output/input burst does not make a terminal tab green: implemented by requiring a 5 second output burst before `working`.
- Sustained output for roughly 5 seconds makes the tab green: implemented by `terminalWorkingThresholdMs`.
- After roughly 5 seconds of no output, a green non-active tab turns yellow: implemented by quiet timer and current-tab check.
- After roughly 5 seconds of no output, a green active tab clears instead of turning yellow: implemented by the same quiet timer current-tab branch.
- Clicking a yellow tab clears it: implemented in terminal tab click handling.
- Typecheck, build, and diff whitespace checks pass: see commands above.

## Result

Verification passed.
