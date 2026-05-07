# Implementation Notes

## Summary

Implemented the first SharkBay MVP coding slice as an Electron + React + TypeScript + Vite desktop app foundation.

The app now has:

- Electron main/preload/IPC shell with narrow renderer-facing APIs.
- React renderer surfaces for dashboard, project detail, root settings, URL editing, create-repo, artifact viewing, and next-action prompts.
- Main-process modules for configured roots, scanner, harness reader, safe harness writer, path safety, git metadata, template installation, prompt generation, revisions, and atomic JSON helpers.
- Bundled harness templates for new managed repositories.
- Focused Vitest tests for scanner, reader, writer, path safety, template installer, and prompt generation.
- A self-hosting path: tests and smoke evidence confirm SharkBay can be discovered as a managed harness project from `<projects-root>`.

Code revision addressed code review findings by tightening configured-root authority and symlink safety:

- Runtime IPC/service entry points now use persisted configured roots as authority instead of trusting renderer-supplied roots.
- Project detail reads now validate repo paths, harness JSON paths, and task artifact paths through configured-root containment and symlink checks.
- Create-repo now requires configured-root validation and rejects symlink targets that would write outside the allowed boundary.
- URL editing no longer sends or exposes the unused manifest runtime mirror flag.

## Changes

| Path | Summary |
| --- | --- |
| `package.json` | Added Electron/Vite/React/TypeScript project metadata, scripts, and dependencies; set `lint` to run the TypeScript static check for this first slice. |
| `package-lock.json` | Added npm lockfile generated with offline package-lock-only install. |
| `index.html` | Added Vite renderer entry HTML. |
| `vite.config.ts` | Added renderer build configuration. |
| `vitest.config.ts` | Added Vitest configuration. |
| `tsconfig.json` | Added shared TypeScript project references. |
| `tsconfig.node.json` | Added Electron/main/test TypeScript configuration. |
| `tsconfig.renderer.json` | Added renderer TypeScript configuration. |
| `.gitignore` | Ignored dependencies, build outputs, coverage, logs, `.DS_Store`, and TypeScript build info. |
| `electron/main.ts` | Added Electron app lifecycle and window startup. |
| `electron/preload.ts` | Added narrow typed preload bridge. |
| `electron/ipc.ts` | Added IPC registration for config, project scan/detail, URL updates, harness updates, repo creation, and prompt generation. |
| `src/shared/types.ts` | Added shared app, project, task, revision, write, and prompt contracts. |
| `src/shared/schema.ts` | Added lightweight validation and normalization helpers. |
| `src/main/config.ts` | Added app config read/write for configured roots. |
| `src/main/scanner.ts` | Added harness repo discovery with manifest and protocol fallback detection. |
| `src/main/harness-reader.ts` | Added harness JSON/task artifact normalization. |
| `src/main/harness-writer.ts` | Added constrained safe JSON patching with revisions, validation, preservation, and atomic writes. |
| `src/main/path-safety.ts` | Added canonical path and configured-root containment checks. |
| `src/main/git.ts` | Added read-only git metadata inspection. |
| `src/main/template-installer.ts` | Added harness template installation with overwrite refusal. |
| `src/main/prompt-generator.ts` | Added next-action prompt generation. |
| `src/main/revision.ts` | Added file revision token computation. |
| `src/main/json-file.ts` | Added JSON read/write helpers. |
| `src/renderer/**` | Added dashboard/detail/settings/create-repo/prompt UI. |
| `src/styles/app.css` | Added quiet, dense application styling. |
| `templates/harness/**` | Added bundled harness starter templates. |
| `tests/**` | Added unit coverage for critical scanner, reader, writer, path, template, and prompt behavior. |
| `src/main/scanner.ts` | Revised runtime scan to ignore renderer-supplied roots and use persisted app config. |
| `src/main/harness-reader.ts` | Revised detail reads to resolve repo, harness JSON files, and task artifacts through safe configured-root checks. |
| `src/main/harness-writer.ts` | Revised runtime writes to ignore renderer-supplied roots and use persisted app config. |
| `src/main/template-installer.ts` | Revised runtime create-repo to use persisted app config and reject unsafe symlink targets. |
| `src/main/path-safety.ts` | Added readable harness/repo file resolution and stricter create-target validation. |
| `src/renderer/App.tsx` | Removed unused manifest runtime mirror request flag from URL updates. |
| `src/renderer/types.ts` | Removed unused renderer URL mirror flag type. |
| `tests/scanner.test.ts` | Added runtime scan root-authority regression coverage. |
| `tests/harness-reader.test.ts` | Added symlinked harness JSON and unsafe task id regression coverage. |
| `tests/harness-writer.test.ts` | Added runtime URL update root-authority regression coverage. |
| `tests/template-installer.test.ts` | Added runtime create root-authority and symlink-target regression coverage. |

## Decisions During Implementation

| Decision | Reason |
| --- | --- |
| Use `npm run typecheck` as the lint script for this slice. | ESLint was present without a configuration file; adding a separate config file was outside the contract's allowed file list. TypeScript static checking gives a real repeatable gate without expanding scope. |
| Generate `package-lock.json` with `npm install --package-lock-only --ignore-scripts --offline`. | `node_modules` already existed from worker verification, and offline lock generation avoided network dependency while creating the required npm lockfile. |
| Stop the dev smoke run with `kill` after startup evidence was captured. | `npm run dev` is a long-running Electron/Vite session; stopping it prevents stray project processes. |
| Keep URL persistence state-only for this slice. | The optional manifest runtime mirror flag was unused and created a contract/UI mismatch; `.agent/state.json` remains authoritative per design. |

## Known Risks

| Risk | Follow-up |
| --- | --- |
| `lint` is currently a TypeScript static check, not ESLint rules. | Add an ESLint flat config in a future contract if stronger style linting is desired. |
| Electron packaging, signing, notarization, and installer work are not implemented. | Defer to a future packaging task after MVP behavior stabilizes. |
| Visual verification was limited to dev smoke startup evidence, not a full screenshot walkthrough. | Complete UI/browser-style manual verification in the verification phase. |
| Coverage command is not configured. | Add coverage tooling in a future task if coverage thresholds become part of the gate. |

## Command Evidence

| Check | Command | Exit Code | Evidence |
| --- | --- | --- | --- |
| Lockfile generation | `npm install --package-lock-only --ignore-scripts --offline` | 0 | `up to date, audited 253 packages`; `found 0 vulnerabilities`. |
| Lint/static check | `npm run lint` | 0 | Ran `npm run typecheck`; both renderer and node TypeScript checks completed with no errors. |
| Typecheck | `npm run typecheck` | 0 | `tsc -p tsconfig.renderer.json --noEmit && tsc -p tsconfig.node.json --noEmit` completed with no errors. |
| Unit tests | `npm test` | 0 | 6 test files passed, 15 tests passed. |
| Build | `npm run build` | 0 | `tsc -p tsconfig.node.json && vite build`; Vite built 31 modules and emitted `dist/renderer`. |
| Dev smoke start | `npm run dev` | stopped after startup | Vite ready at `http://127.0.0.1:5173/`; TypeScript watch found 0 errors; Electron launched. Devtools Autofill console warning observed, non-blocking. |
| Whitespace check | `git diff --check` | 0 | No whitespace errors reported. |
| Code revision typecheck | `npm run typecheck` | 0 | Renderer and node TypeScript checks completed with no errors after safety fixes. |
| Code revision tests | `npm test` | 0 | 6 test files passed, 19 tests passed after adding root-authority and symlink regression tests. |
| Code revision lint/static check | `npm run lint` | 0 | Script delegates to `npm run typecheck`; completed without errors after safety fixes. |
| Code revision build | `npm run build` | 0 | `tsc -p tsconfig.node.json && vite build`; Vite transformed 31 modules and emitted `dist/renderer`. |
| Code revision whitespace check | `git diff --check` | 0 | No whitespace errors reported after safety fixes. |
