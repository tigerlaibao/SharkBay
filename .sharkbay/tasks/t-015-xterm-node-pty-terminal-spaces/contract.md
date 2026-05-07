# Contract

## Done Criteria

- `node-pty` replaces piped child processes in terminal runtime.
- `@xterm/xterm` replaces custom output/input UI.
- Terminal spaces are scoped per project candidate, not global per selected project.
- Hidden terminal spaces are not visible and their sessions remain alive.
- New tabs are added only to the active project's terminal space.
- Native rebuild support is added for Electron.
- Required checks run and results are recorded.

## In Scope Files

- `package.json`
- `package-lock.json`
- `src/main/terminal.ts`
- `electron/ipc.ts`
- `electron/preload.mts`
- `src/shared/types.ts`
- `src/renderer/types.ts`
- `src/renderer/App.tsx`
- `src/styles/app.css`
- `tests/terminal.test.ts`
- Task and repo documentation artifacts.

## Required Checks

- `npm run typecheck`
- `npm test`
- `npm run build`
- native rebuild command for `node-pty`
- `git diff --check`

## Stop Conditions

- Stop before weakening configured-root validation.
- Stop if `node-pty` cannot be rebuilt for Electron and no safe fallback is available.
