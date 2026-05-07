# Verification

## Checks Run

| Check | Command | Exit Code | Result | Evidence |
| --- | --- | --- | --- | --- |
| Typecheck | `npm run typecheck` | 0 | pass | Renderer and node TypeScript projects compile. |
| Lint/static check | `npm run lint` | 0 | pass | Lint delegates to typecheck. |
| Tests | `npm test` | 0 | pass | 8 test files, 27 tests passed. |
| Build | `npm run build` | 0 | pass | Node build emitted `preload.mjs`; Vite built renderer bundle. |
| Whitespace | `git diff --check` | 0 | pass | No whitespace errors. |
| Harness JSON | `jq empty .agent/manifest.json .agent/state.json .agent/queue.json` | 0 | pass | JSON mirrors remain parseable. |
| Dev smoke | `npm run dev` | 0 after manual stop | pass | Electron started, TypeScript watch had 0 errors, app loaded with bridge ready. |

## Evidence Artifacts

| Type | Path | Notes |
| --- | --- | --- |
| Runtime config | `<user-config-dir>/sharkbay/config.json` | Dogfood app config contains `<projects-root>` as a configured root. |
| Build output | `dist-electron/electron/preload.mjs` | Verified emitted after `npm run build`. |

## Manual Verification

| Scenario | Steps | Observed Result | Evidence |
| --- | --- | --- | --- |
| Self-host scan | Start `npm run dev` with `<projects-root>` configured. | App scanned 1 project, listed SharkBay, self-host marker visible, current task `t-003-dogfood-self-hosting-flow` shown in `verification`. | Computer Use app state. |
| Detail view | Let initial scan select SharkBay. | Detail pane showed manifest project, repo URL, branch, worktree, active task, phase, pending gate, URL editor, queue, revisions, artifacts, recent decisions, and no harness errors. | Computer Use app state. |
| Prompt flow | Click Generate during dogfood pass. | Prompt generated with repo path, task id, phase, required checks, and stop conditions. | Computer Use app state from coding pass. |
| Responsive layout | View default Electron window after breakpoint change. | Dashboard and detail panes no longer clipped at the default window width. | Visual smoke. |

## Cross-Validation

| Critical Behavior | Test or Script | Result | Notes |
| --- | --- | --- | --- |
| Preload bridge loads | `npm run dev` | pass | App no longer shows `Waiting for window.sharkBay`; scan runs on startup. |
| Gate fallback | `npm test -- tests/renderer-workflow.test.ts` and full `npm test` | pass | Covers coding -> pending, done -> pass, blocked -> blocked, explicit statuses. |
| Self-host discovery | App scan and existing scanner tests | pass | SharkBay appears as manifest/self-host project. |
| Build correctness | `npm run build` | pass | Clean source emits `.mjs` preload referenced by main process. |

## Skipped Checks

| Check | Reason | Risk |
| --- | --- | --- |
| none | none | none |

## Result

- [x] Pass
- [ ] Fail
