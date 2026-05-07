# Verification

## Automated Checks

| Command | Exit | Evidence |
| --- | --- | --- |
| `npm run typecheck` | 0 | `tsc -p tsconfig.renderer.json --noEmit && tsc -p tsconfig.node.json --noEmit` completed with no diagnostics. |
| `npm test` | 0 | Vitest reported 9 files passed, 49 tests passed after adding terminal input/output and zsh startup regression coverage. |
| `npm run build` | 0 | Vite transformed 32 modules and wrote renderer assets successfully. |
| `git diff --check` | 0 | No whitespace errors reported. |

## Focused Coverage

- `tests/terminal.test.ts` verifies terminal cwd validation accepts configured-root project directories, rejects outside directories, can create/close a terminal session in a safe cwd, can send input then receive command output, and starts shells without interactive TTY-only flags or Apple session restore.

## UI Smoke

- `curl -I http://127.0.0.1:5173/` returned HTTP 200 from an existing Vite server.
- Browser smoke loaded `http://127.0.0.1:5173/`.
- DOM snapshot contained the workbench controls and the `Terminal` pane with `No terminal open`.
- Full-page screenshot confirmed the three-column layout: projects, detail/tasks, and far-right terminal.
- Browser console error log was empty.

## Residual Risk

The browser smoke uses Vite without Electron preload, so it confirms layout but not live terminal IPC in the browser. Live terminal IPC is covered by main-process tests and TypeScript checks.
