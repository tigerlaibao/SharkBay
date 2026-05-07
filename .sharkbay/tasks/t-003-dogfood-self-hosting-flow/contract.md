# Implementation Contract

## 1. Objective

Dogfood the self-hosting workflow in the running Electron app and fix up to three small first-use UX issues without changing core architecture or safety boundaries.

## 2. In Scope

- Start and inspect the dev app.
- Confirm the root scan can find SharkBay.
- Make small renderer/style/test fixes for observed workflow friction.
- Record implementation evidence.

## 3. Out of Scope

- Direct Codex execution.
- Background jobs/watchers.
- Packaging/signing/notarization.
- Broad redesign.
- Core scanner/writer safety model changes.

## 4. Files Allowed to Change

| Path | Reason |
| --- | --- |
| `src/renderer/App.tsx` | Small workflow UI/interaction fixes. |
| `src/renderer/workflow.ts` | Presentational helper fixes if needed. |
| `src/renderer/types.ts` | Renderer type refinements if needed. |
| `src/styles/app.css` | Layout/visual feedback polish. |
| `electron/main.ts` | Point BrowserWindow at the correctly emitted preload module if dogfooding finds bridge startup friction. |
| `electron/preload.mts` | Keep the existing preload bridge loadable as an Electron ESM preload module. |
| `tsconfig.node.json` | Include `.mts` Electron files in node compilation. |
| `tests/renderer-workflow.test.ts` | Test helper/workflow changes. |
| `tests/self-host-workflow.test.ts` | Test workflow behavior if changed. |
| `tasks/t-003-dogfood-self-hosting-flow/implementation.md` | Coding artifact. |

## 5. Done Criteria

- Dev app starts and is stopped cleanly.
- SharkBay can be found through self-host scan.
- Up to three small observed UX issues are fixed or explicitly deferred.
- Required checks pass.
- Implementation notes record observations, changes, evidence, and residual risks.

## 6. Required Checks

| Check | Command | Required |
| --- | --- | --- |
| Typecheck | `npm run typecheck` | Yes |
| Lint/static check | `npm run lint` | Yes |
| Tests | `npm test` | Yes |
| Build | `npm run build` | Yes |
| Whitespace | `git diff --check` | Yes |
| Dev smoke | `npm run dev` | Yes |

## 7. Cross-Validation Requirement

For critical logic, specify the test or validation script that must prove the behavior.

| Critical Behavior | Test/Script | Evidence Expected |
| --- | --- | --- |
| Self-host discovery | self-host scan probe or app observation | SharkBay appears with current task/phase. |
| UI helper behavior | `npm test` | Existing workflow tests continue to pass. |
| Renderer integration | `npm run typecheck` and `npm run build` | UI compiles and builds. |

## 8. Stop Conditions

Stop and ask the user if:

- Scope needs to expand.
- A required command cannot run.
- An architectural assumption is wrong.
- A risky or destructive action appears necessary.
- More than three UX issues need fixing.
- A fix requires core scanner/writer safety changes.
- A fix requires new dependencies or new broad IPC.
