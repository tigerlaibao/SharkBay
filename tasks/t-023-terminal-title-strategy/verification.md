# Verification

## Checks

| Check | Exit | Evidence |
| --- | --- | --- |
| `npm test -- tests/terminal.test.ts` | 0 | `tests/terminal.test.ts  (7 tests)` and `Test Files  1 passed (1)`; revision run passed at 20:32 with regression coverage for OSC responses and interactive foreground app titles |
| `npm run typecheck` | 0 | `tsc -p tsconfig.renderer.json --noEmit && tsc -p tsconfig.node.json --noEmit` completed without errors |
| `npm test` | 0 | `Test Files  10 passed (10)` and `Tests  54 passed (54)` |
| `npm run build` | 0 | `✓ 36 modules transformed` and revision run built in `538ms`; Vite reported the existing chunk-size warning |
| `git diff --check` | 0 | No whitespace errors |

## Done Criteria Mapping

| Done Criterion | Evidence |
| --- | --- |
| Default title uses project-relative cwd | Focused `terminalDisplayTitle` test covers `.` and `src/main` cases. |
| Occupying commands use foreground command title | Focused `terminalDisplayTitle` test covers `pnpm dev:server` and `top`. |
| Interactive foreground apps keep their process title | Focused `terminalDisplayTitle` test covers `codex` with an OSC-like captured line and `claude` with internal prompt text. |
| OSC color responses do not become input text | Focused `applyTerminalInputData` test covers `ESC ] 10 ; rgb:... BEL` and `ESC ] ... ESC \` forms. |
| Renderer receives title updates | Typecheck and build cover the new `terminal:update` IPC/preload/renderer contract. |
| Existing PTY safety remains intact | Full terminal tests and full suite passed. |

## Residual Risk

Commands launched from shell history without typed text may show the process name instead of the full original command line.
