# Code Review

## Findings

No blocker or major findings after revision.

## Review Notes

- Verified the implementation stays inside the existing terminal manager, IPC bridge, renderer tab state, and focused terminal tests.
- Confirmed terminal cwd authority still uses `resolveTerminalCwd` and configured-root validation before spawning a PTY.
- Self-review found one stale-update race: an async title refresh could complete after a tab was closed. Fixed by marking sessions exited during close and rechecking session identity/status after async cwd inspection.

## Gate

| Severity | Count |
| --- | --- |
| blocker | 0 |
| major | 0 |
| minor | 0 |

Code review passes.

## Revision Review: 2026-05-06

The user correctly identified that the first implementation did not satisfy the intended interaction model for `codex`/`claude`/`top` style foreground apps. Review confirmed the fix is scoped to terminal title derivation:

- `codex`, `claude`, and monitor-style foreground apps now return the foreground process name before considering captured input.
- Submitted input is ignored for title capture when the foreground process is already non-shell, preventing prompts typed inside Codex/Claude from becoming tab titles.
- OSC terminal control responses are skipped before input text accumulation, covering the observed `10;rgb:d9d9/e5e5/dfdf` regression.
- Existing cwd titles and long-running command titles such as `pnpm dev:server` remain covered by tests.

Gate remains pass with blocker=0 and major=0.
