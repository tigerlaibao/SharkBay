# Implementation Contract

## Goal

Implement confirmation-gated Ripple setup for existing not-setup project directories.

## Ownership

| File | Responsibility |
| --- | --- |
| `src/shared/types.ts` | Add optional setup flag to shared create input. |
| `src/renderer/types.ts` | Mirror optional setup flag for bridge input. |
| `src/main/template-installer.ts` | Support confirmed existing-directory installs while preserving default refusal and no-overwrite guarantees. |
| `src/renderer/App.tsx` | Add not-setup setup confirmation UI and refresh behavior. |
| `src/styles/app.css` | Add only compact styles needed for the confirmation panel. |
| `tests/template-installer.test.ts` | Cover safe existing-directory setup and failure modes. |
| `tasks/t-007-ripple-setup-flow/*` | Keep task artifacts current. |

## Required Behavior

- Settings/new-project creation still refuses non-empty targets by default.
- Existing project setup passes `allowExistingDirectory: true`.
- Existing `.agent` is rejected.
- Existing target file collisions are rejected before overwrite.
- Runtime IPC uses persisted configured roots, not renderer-supplied roots.
- On success, the renderer refreshes projects and selects the setup project.
- Errors are shown inline and via existing toast behavior when useful.

## Required Checks

- `npm run typecheck`
- `npm test -- tests/template-installer.test.ts`
- `npm test`
- `npm run build`
- `git diff --check`

## Stop Conditions

- Any implementation requires overwriting user files.
- Any write path can escape configured roots through symlinks.
- Setup requires running arbitrary project commands.
