# Implementation Contract

## 1. Objective

Implement the self-hosting dashboard workflow polish: the user can add a root, scan, identify SharkBay itself, open a useful detail view, safely edit URLs, and copy a next-action prompt with clear feedback.

This is a UI/workflow slice. It should build on the existing Electron/React foundation and avoid changing the core scanner/writer safety model unless a bug blocks the workflow.

## 2. In Scope

- Dashboard first-run/empty state for no configured roots and no discovered projects.
- Root add/list/remove controls visible from the dashboard workflow.
- Scan feedback: loading, last scan time, project count, unavailable root count, and scan/root errors.
- Project table polish for name, path, detection, branch/dirty state, active task, phase, gate, URLs, and presentational self-host marker.
- Detail view sections for overview, queue, current task artifacts, recent decisions, harness errors, revisions, URL editor, and prompt panel.
- URL editor feedback for saving, saved state, stale/conflict/error responses, and detail refresh after save.
- Prompt generation/copy feedback with visible prompt text.
- Renderer/helper tests or scripted tests for workflow behavior listed in cross-validation.
- Implementation notes and command evidence.

## 3. Out of Scope

- Direct Codex execution or command running from the UI.
- Background scan/watch mode.
- Packaged macOS signing, notarization, installer, release automation, or auto-update.
- Rewriting scanner, reader, writer, template installer, or IPC authority boundaries unless a workflow bug requires a tightly scoped fix.
- Generic filesystem access from the renderer.
- Full Markdown editor or rich Markdown renderer.
- Cloud sync, accounts, billing, permissions, remote project management, or multi-user collaboration.

## 4. Files Allowed to Change

| Path | Reason |
| --- | --- |
| `src/renderer/App.tsx` | Main workflow UI and helper logic. |
| `src/renderer/workflow.ts` | Renderer workflow helpers shared by UI and tests. |
| `src/renderer/types.ts` | Renderer-only type refinements for workflow state and bridge results. |
| `src/renderer/sharkbay-api.d.ts` | Keep global bridge type declarations aligned if needed. |
| `src/styles/app.css` | Workflow layout, empty states, markers, diagnostics, and feedback styles. |
| `tests/renderer-workflow.test.ts` | Focused helper/workflow tests. |
| `tests/self-host-workflow.test.ts` | Scripted workflow checks for root config, self-host discovery, URL update, detail data, and prompt content. |
| `tests/helpers.ts` | Shared test fixtures if needed. |
| `src/main/config.ts` | Only if root persistence workflow exposes a bug; do not change authority model. |
| `src/main/harness-reader.ts` | Only if detail data coverage exposes a bug; preserve safety checks. |
| `src/main/harness-writer.ts` | Only if URL save/conflict behavior exposes a bug; preserve safe writer guarantees. |
| `src/main/prompt-generator.ts` | Only if prompt content fails the contract; keep output deterministic. |
| `tasks/t-002-self-hosting-ux/implementation.md` | Coding artifact and command evidence. |

## 5. Done Criteria

- User can add a root from the dashboard workflow and see it listed without restarting.
- User can scan and see clear scan status, project count, and root error feedback.
- If a configured root contains this repository, SharkBay appears as a project with name/path/detection/task/phase/dirty data.
- A deterministic renderer-only self-host marker appears for the SharkBay project without changing scanner/reader behavior.
- Detail view explicitly shows overview, queue sections, task artifacts, recent decisions, harness errors, revision tokens, URL editor, and next-action prompt panel.
- URL edits use the existing safe update path, refresh detail state on success, and show conflict/error feedback on failure.
- Prompt generation includes repo path, task id, phase, protocol reference, required checks, stop conditions, and no-chat-memory instruction; copy action gives visible success/failure feedback.
- Required checks pass or exact failures are recorded.
- `implementation.md` records changed files, behavior, command evidence, and known risks.

## 6. Required Checks

| Check | Command | Required |
| --- | --- | --- |
| Typecheck | `npm run typecheck` | Yes |
| Lint/static check | `npm run lint` | Yes |
| Unit/workflow tests | `npm test` | Yes |
| Build | `npm run build` | Yes |
| Whitespace check | `git diff --check` | Yes |
| Dev smoke | `npm run dev` | Yes, may be stopped after startup evidence is captured |

## 7. Cross-Validation Requirement

For critical logic, specify the test or validation script that must prove the behavior.

| Critical Behavior | Test/Script | Evidence Expected |
| --- | --- | --- |
| Root add/list/remove persistence | `npm test -- self-host-workflow` or equivalent | Config helper persists roots, lists them, and removes them in a temp config. |
| Self-host discovery | `npm test -- self-host-workflow` plus self-host scan probe when practical | Fixture SharkBay repo is discovered; local `<projects-root>` probe finds this repo when available. |
| Detail data coverage | `npm test -- renderer-workflow` or equivalent | Helper/render-state logic accounts for overview, queue, artifacts, recent decisions, errors, revisions, URL editor, and prompt sections. |
| URL edit success and conflict | `npm test -- self-host-workflow` or equivalent | Safe URL update succeeds with current revision and fails with stale revision without changing file. |
| Prompt content | `npm test -- self-host-workflow` or existing prompt tests | Prompt includes repo path, task id, phase, protocol reference, checks, stop conditions, and no-chat-memory warning. |
| Self-host marker helper | `npm test -- renderer-workflow` or equivalent | Marker returns true for SharkBay-like project and false for unrelated projects; helper is presentational only. |
| Renderer app integration | `npm run typecheck` and `npm run build` | UI compiles and production renderer builds. |

## 8. Stop Conditions

Stop and ask the user if:

- Scope needs to expand.
- A required command cannot run.
- An architectural assumption is wrong.
- A risky or destructive action appears necessary.
- Implementation requires broad IPC or renderer filesystem authority.
- Implementation requires direct Codex execution or background automation.
- Core scanner/writer safety behavior must be loosened to make the UI work.
- URL editing would need to write files outside `.agent/state.json` through the existing safe writer.
- Files outside the allowed list need changes.
- Package/dependency changes are needed beyond test/UI support.
