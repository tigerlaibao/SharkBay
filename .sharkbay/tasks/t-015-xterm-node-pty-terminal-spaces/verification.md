# Verification

## Automated Checks

| Command | Exit | Evidence |
| --- | --- | --- |
| `npm run rebuild:native` | 0 | Electron rebuild reported `Rebuild Complete` for `node-pty`. |
| `npm run typecheck` | 0 | Renderer and node TypeScript checks completed with no diagnostics. |
| `npm test` | 0 | Vitest reported 9 files passed, 49 tests passed. |
| `npm run build` | 0 | Vite transformed 36 modules and wrote renderer assets. It warned that the xterm bundle chunk is over 500 kB. |
| `git diff --check` | 0 | No whitespace errors reported. |

## Focused Coverage

- `tests/terminal.test.ts` verifies cwd validation, outside-root rejection, PTY create/close, shell startup shape, and input/output streaming.

## UI Smoke

- `curl -I http://127.0.0.1:5173/` returned HTTP 200.
- Browser smoke loaded the Vite renderer and confirmed the far-right Terminal pane is visible.
- Browser logs still contained a stale HMR error from an earlier syntax-fix cycle; the current DOM rendered after reload and typecheck/build passed.

## Residual Risk

The browser smoke runs without Electron preload, so live IPC/xterm interaction is covered by main-process tests and native rebuild rather than by the Vite browser.
