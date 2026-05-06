# Contract

## Files In Scope

- `src/renderer/App.tsx`
- `src/styles/app.css`
- `tasks/t-016-resizable-workbench-columns/*`
- `.agent/queue.json`
- `.agent/queue.md`
- `.agent/state.json`
- `.agent/state.md`
- `.agent/runner.json`
- `docs/task.md`

## Files Out Of Scope

- Electron terminal backend.
- `node-pty` setup.
- Project discovery and task detail data logic.

## Required Checks

- `npm run typecheck`
- `npm test`
- `npm run build`
- `git diff --check`

## Stop Conditions

- Stop before changing terminal process lifecycle.
- Stop if width persistence requires a broader settings schema.
