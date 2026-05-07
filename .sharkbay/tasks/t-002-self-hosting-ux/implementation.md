# Implementation Notes

## Summary

Implemented the self-hosting workflow polish for SharkBay's dashboard/detail flow.

The app now has clearer first-run/root setup states, dashboard scan feedback, presentational self-host markers, richer project detail sections, URL save/conflict feedback, prompt generation/copy feedback, and workflow-focused tests.

## Changes

| Path | Summary |
| --- | --- |
| `src/renderer/App.tsx` | Added workflow UI polish for root controls, scan metadata, self-host markers, detail sections, URL save state, and prompt copy feedback. |
| `src/renderer/types.ts` | Refined renderer workflow types. |
| `src/renderer/workflow.ts` | Added exported renderer workflow helper for the self-host marker so tests cover the real predicate. |
| `src/styles/app.css` | Added styling for first-run states, scan feedback, markers, diagnostics, detail sections, and copy/save states. |
| `src/main/scanner.ts` | Revised runtime scan to return full `ScanProjectsResult` metadata instead of only projects. |
| `electron/ipc.ts` | Updated scan IPC service/result type to return root metadata. |
| `electron/preload.ts` | Updated scan bridge result type to return root metadata. |
| `tsconfig.node.json` | Included renderer workflow helper for test typechecking. |
| `tests/helpers.ts` | Extended fixture helpers for workflow tests. |
| `tests/self-host-workflow.test.ts` | Added scripted tests for root persistence, self-host discovery, URL update/conflict behavior, and prompt content. |
| `tests/renderer-workflow.test.ts` | Added renderer workflow helper/expectation coverage for detail data and self-host marker behavior. |

## Decisions During Implementation

| Decision | Reason |
| --- | --- |
| Keep self-host detection presentational in the renderer. | The design requires no scanner/reader special casing; a marker can help UX without changing authority or data semantics. |
| Keep workflow tests focused on helpers and main-process services rather than full browser automation. | This preserves fast, reliable verification while still proving root persistence, self-host discovery, URL update/conflict behavior, and prompt content. |
| Return full scan metadata from runtime scan IPC. | Code review found the UI could not show unavailable root counts/errors from a live Electron scan while IPC returned only project arrays. |

## Known Risks

| Risk | Follow-up |
| --- | --- |
| Manual UI verification is still lighter than a full screenshot walkthrough. | Verification phase should run dev smoke and, when practical, inspect the app visually. |
| The self-host marker is heuristic and presentational. | If SharkBay later manages multiple repos named SharkBay, introduce explicit app/repo identity metadata for the marker. |

## Command Evidence

| Check | Command | Exit Code | Evidence |
| --- | --- | --- | --- |
| Typecheck | `npm run typecheck` | 0 | Renderer and node TypeScript checks completed without errors. |
| Lint/static check | `npm run lint` | 0 | Script delegates to `npm run typecheck`; completed without errors. |
| Unit/workflow tests | `npm test` | 0 | 8 test files passed, 26 tests passed. |
| Build | `npm run build` | 0 | Vite transformed 31 modules and emitted `dist/renderer`; CSS bundle grew to 12.45 kB and JS to 172.58 kB. |
| Whitespace check | `git diff --check` | 0 | No whitespace errors reported. |
| Dev smoke | `npm run dev` | stopped after startup | Vite ready at `http://127.0.0.1:5173/`; TypeScript watch found 0 errors; Electron launched. Non-blocking Chromium DevTools `Autofill.enable` warning observed. |
| Code revision typecheck | `npm run typecheck` | 0 | Renderer and node TypeScript checks completed without errors after scan metadata/helper fixes. |
| Code revision tests | `npm test` | 0 | 8 test files passed, 26 tests passed. |
| Code revision lint/static check | `npm run lint` | 0 | Script delegates to typecheck; completed without errors. |
| Code revision build | `npm run build` | 0 | Vite transformed 32 modules and emitted `dist/renderer`. |
| Code revision whitespace check | `git diff --check` | 0 | No whitespace errors reported. |
