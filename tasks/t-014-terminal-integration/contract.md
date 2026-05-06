# Contract

## Done Criteria

- Dashboard workbench renders without the old far-left sidebar.
- Project list remains selectable for managed and not-setup candidates.
- Detail/tasks pane remains functional in the middle.
- Terminal pane opens a shell in the selected project directory.
- Terminal supports multiple tabs, input, streaming output, and close behavior.
- Terminal cwd validation uses configured-root containment in the main process.

## In Scope Files

- `src/main/terminal.ts`
- `electron/ipc.ts`
- `electron/preload.mts`
- `src/shared/types.ts`
- `src/renderer/sharkbay-api.d.ts`
- `src/renderer/App.tsx`
- `src/styles/app.css`
- `tests/terminal.test.ts`
- Task artifacts and synchronized harness queue/state docs.

## Out of Scope Files

- Template installer behavior.
- Harness reader semantics unrelated to terminal sessions.
- Git or deployment automation.

## Required Checks

- `npm run typecheck`
- `npm test`
- `npm run build`
- `git diff --check`

## Stop Conditions

- Stop before adding external dependencies that require network install unless the user approves.
- Stop before changing configured-root authority semantics.
- Stop before destructive process management beyond killing terminal child processes owned by SharkBay.
