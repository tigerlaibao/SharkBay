# Task Status

## Metadata

| Field | Value |
| --- | --- |
| Task ID | `t-015-xterm-node-pty-terminal-spaces` |
| Title | Replace terminal with xterm and node-pty project spaces |
| Priority | 1 |
| Phase | done |
| Owner Role | Controller |
| Depends On | `t-014-terminal-integration` |
| Created | 2026-05-06 |
| Updated | 2026-05-06 |

## Goal

Replace the lightweight pipe terminal with a real PTY-backed xterm terminal. Each project should own a terminal space with multiple tabs. Switching projects switches the visible terminal space without stopping hidden sessions.

## Current Gate

Done.

## Next Action

Ready for the next task.

## Blockers

None.

## Outcome

Replaced the temporary terminal with `node-pty` and `@xterm/xterm`. Terminal tabs are now scoped inside per-project terminal spaces, and hidden project spaces remain mounted so their sessions continue running while other projects are selected.

## Verification Summary

- `npm run rebuild:native` passed.
- `npm run typecheck` passed.
- `npm test` passed with 9 files / 49 tests.
- `npm run build` passed with an expected xterm chunk-size warning.
- `git diff --check` passed.
- Browser smoke confirmed the Terminal pane still renders in the three-column workbench.
