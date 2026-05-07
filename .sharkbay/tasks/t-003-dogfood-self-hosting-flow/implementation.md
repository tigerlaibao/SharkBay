# Implementation Notes

## Summary

Dogfooded the dev Electron app against this SharkBay repository. The first startup exposed a blocking preload bridge issue, then the app successfully scanned `<projects-root>`, found SharkBay as a self-host project, opened the detail pane, generated the next-action prompt, and displayed current task artifacts.

## Changes

| Path | Summary |
| --- | --- |
| `electron/main.ts` | Pointed BrowserWindow at the emitted `preload.mjs` file so the preload bridge loads in Electron. |
| `electron/preload.mts` | Renamed the preload source from `.ts` to `.mts` so TypeScript emits an Electron-loadable ESM preload module. |
| `tsconfig.node.json` | Included Electron `.mts` files in node compilation. |
| `src/renderer/workflow.ts` | Added stable gate display fallbacks for active workflow tasks. |
| `src/renderer/App.tsx` | Routed project gate rendering through the workflow fallback helper. |
| `src/styles/app.css` | Raised the single-column dashboard breakpoint and made placeholder/disabled button states clearer. |
| `tests/renderer-workflow.test.ts` | Added coverage for gate display fallback behavior. |
| `tasks/t-003-dogfood-self-hosting-flow/contract.md` | Narrowly expanded the contract for the preload bridge fix after dogfooding found the blocker. |
| `tasks/t-003-dogfood-self-hosting-flow/decisions.md` | Recorded why the contract expansion stayed narrow and non-architectural. |

## Decisions During Implementation

| Decision | Reason |
| --- | --- |
| Use `.mts` for Electron preload | Electron ESM preload detection depends on the `.mjs` extension, and TypeScript emits `.mjs` from `.mts`. |
| Treat unknown gate metadata on an active task as display-only pending/pass fallback | The dashboard had enough task context to avoid showing a confusing `unknown` badge during normal active workflow states. |
| Raise the responsive breakpoint to 1280px | The two-column dashboard plus sidebar clipped at the default Electron window width. |
| Preserve blocked display fallback | Review found that missing explicit gate metadata should not hide an active blocked phase. |

## Known Risks

| Risk | Follow-up |
| --- | --- |
| Desktop automation could not reliably type into the first-run root field, so `<projects-root>` was added to the SharkBay runtime config to continue the dogfood pass. | Add a future app-level directory picker or suggested-root affordance instead of relying on raw path typing. |
| Refreshing a scan with the same selected project can leave detail data stale until a detail reload. | Consider refreshing detail after successful scans in a later task. |
| The self-host marker still relies on a narrow SharkBay path/name heuristic. | Normalize path strings more defensively in a later UI polish task. |

## Evidence

| Check | Result |
| --- | --- |
| Dogfood startup | Initial run showed preload bridge missing; after `.mts` fix, Electron loaded with bridge ready. |
| Self-host scan | App scanned `<projects-root>`, found one SharkBay project, and selected task `t-003-dogfood-self-hosting-flow` in `coding`. |
| Prompt generation | Next Action Prompt generated for `<repo-root>` with required checks and stop conditions. |
| `npm run typecheck` | pass |
| `npm run lint` | pass |
| `npm test` | pass, 8 files / 27 tests |
| `npm run build` | pass |
| `git diff --check` | pass |
| `jq empty .agent/manifest.json .agent/state.json .agent/queue.json` | pass |
| Final dev smoke | pass; app restarted after build, bridge loaded, scan found SharkBay, gate displayed `pending`. |
