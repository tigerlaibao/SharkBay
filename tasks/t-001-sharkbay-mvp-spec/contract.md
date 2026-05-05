# Implementation Contract

## 1. Objective

Implement the first SharkBay MVP coding slice: a local Electron + React + TypeScript + Vite app foundation that can scan configured roots for harness repositories, read and normalize harness state, safely write the narrow allowed harness JSON fields, create new harness repos from bundled templates, generate copyable next-action prompts, and present the initial dashboard/detail/settings/create-repo/prompt UI surfaces.

The slice must prove the self-hosting path without special-casing this repository: when `<projects-root>` or another configured root contains `<repo-root>`, the app discovers SharkBay as a harness project, reads its `.agent/` JSON and task artifacts, and displays the active task and phase from disk.

## 2. In Scope

- Scaffold Electron, React, TypeScript, and Vite with repeatable npm scripts for development, typecheck, lint, test, and build.
- Add shared TypeScript contracts for project summaries, project details, task queue items, gate state, revision tokens, URL fields, config, create-repo input/output, safe write results, and prompt generation.
- Implement main-process modules for app config, root scanning, harness reading, constrained harness JSON writing, path containment, git metadata, template installation, prompt generation, and IPC registration.
- Implement path-safety checks using canonical absolute paths, realpath resolution, configured-root containment, path-segment boundaries, and symlink escape rejection.
- Implement scanner behavior for `.agent/manifest.json` detection, `.agent/protocol.md` fallback detection, ignored heavy directories, invalid/missing JSON visibility, and root-unavailable handling.
- Implement harness reader normalization for `.agent/manifest.json`, `.agent/state.json`, `.agent/queue.json`, selected task Markdown artifacts, URL fallback/null behavior, revision tokens, parse errors, and self-host discovery.
- Implement harness writer behavior for typed patches only, allowlisted `.agent/manifest.json`, `.agent/state.json`, and `.agent/queue.json` updates, expected-revision conflict detection, schema validation, unknown-field preservation, stable JSON serialization, temp-file write, fsync where available, atomic rename, parent-directory fsync where available, and post-write re-read.
- Implement URL persistence with `.agent/state.json` as source of truth for `project.localUrl`, `project.testUrl`, and `project.deploymentUrl`; normalize missing, empty, and `"unknown"` values to `null`; validate accepted URL schemes; optionally mirror into existing manifest runtime URL keys only when that object and keys already exist.
- Implement create-repo behavior from bundled harness templates, including refusal for non-empty target directories and refusal to overwrite existing harness files.
- Add bundled harness templates under `templates/harness/` for new project `.agent/`, `docs/`, and `tasks/` starter files.
- Implement a quiet, information-dense renderer with initial dashboard, project detail, settings/root management, create repo, URL editing, and copyable next-action prompt surfaces.
- Add focused unit tests and fixtures for scanner, reader, writer, path safety, URL persistence, template installation, and prompt generation.
- Write implementation notes in `tasks/t-001-sharkbay-mvp-spec/implementation.md` after coding, including user-visible behavior, required check results or exact failures, and known risks.

## 3. Out of Scope

- Packaged macOS signing, notarization, auto-update, installer creation, or release automation.
- Direct Codex invocation, background agent execution, workflow orchestration, or command running from the UI.
- Cloud sync, accounts, billing, permissions, remote execution, or multi-user collaboration.
- Production deployment, Vercel integration, or remote project management.
- Background filesystem watching beyond manual scan/refresh.
- Full Markdown parsing beyond displaying selected task artifacts and extracting lightweight review/evidence summaries when straightforward.
- Generic filesystem read/write IPC. The renderer must use only narrow typed IPC methods.
- Blind full-file replacement of existing managed repo harness JSON.
- Queue/state/status phase transitions for this task. The controller owns `.agent/state.json`, `.agent/queue.json`, `.agent/state.md`, `.agent/queue.md`, and `tasks/t-001-sharkbay-mvp-spec/status.md`.
- Documentation phase updates to `docs/task.md`, `docs/learnings.md`, or architecture/product docs, unless the user explicitly expands the coding slice or a blocker requires contract revision.

## 4. Files Allowed to Change

| Path | Reason |
| --- | --- |
| `package.json` | Define project metadata, Electron/Vite/React/TypeScript dependencies, and npm scripts. |
| `package-lock.json` | Lock npm dependency versions if npm is used to install the scaffold dependencies. |
| `index.html` | Vite renderer HTML entry. |
| `vite.config.ts` | Renderer build/dev-server configuration. |
| `tsconfig.json` | Shared TypeScript base configuration. |
| `tsconfig.node.json` | Main/preload/test TypeScript configuration if separated from renderer config. |
| `tsconfig.renderer.json` | Renderer TypeScript configuration if the scaffold splits configs. |
| `electron/main.ts` | Electron app lifecycle, window creation, and main-process startup. |
| `electron/preload.ts` | Typed, narrow renderer bridge without exposing Node globals. |
| `electron/ipc.ts` | IPC registration and request/response mapping, if kept separate from `main.ts`. |
| `src/shared/types.ts` | Shared data contracts used across main, preload, renderer, and tests. |
| `src/shared/schema.ts` | Lightweight schema/validation helpers for harness JSON and IPC payloads, if separate from types. |
| `src/main/config.ts` | App config load/save for configured roots and development config override. |
| `src/main/scanner.ts` | Harness repo discovery under configured roots. |
| `src/main/harness-reader.ts` | Read and normalize `.agent/` JSON plus selected task artifacts. |
| `src/main/harness-writer.ts` | Constrained read-modify-write updates for supported harness JSON files. |
| `src/main/path-safety.ts` | Canonicalization, containment checks, target-file checks, and symlink escape prevention. |
| `src/main/git.ts` | Read-only git branch, dirty state, and remote-origin inspection. |
| `src/main/template-installer.ts` | Harness repo creation from bundled templates. |
| `src/main/prompt-generator.ts` | Next-action prompt generation from project/task state. |
| `src/main/revision.ts` | Revision-token computation if factored out of reader/writer. |
| `src/main/json-file.ts` | Atomic JSON read/write helpers if factored out of writer. |
| `src/renderer/**` | React dashboard, detail, settings, create-repo, prompt, URL editing, and app shell UI. |
| `src/styles/**` | Renderer styling if styles are split from components. |
| `templates/harness/**` | Bundled starter harness files for new repositories. |
| `tests/**` | Unit tests, fixtures, and validation helpers for this slice. |
| `vitest.config.ts` | Test runner configuration. |
| `.gitignore` | Ignore generated dependency/build/test artifacts such as `node_modules`, `dist`, `coverage`, and Electron output. |
| `tasks/t-001-sharkbay-mvp-spec/implementation.md` | Coding-phase artifact required by the harness protocol. |

No other files may be changed during coding without stopping for user approval or a revised contract. In particular, do not edit `.agent/state.json`, `.agent/queue.json`, `.agent/state.md`, `.agent/queue.md`, `tasks/t-001-sharkbay-mvp-spec/status.md`, `tasks/t-001-sharkbay-mvp-spec/spec.md`, `tasks/t-001-sharkbay-mvp-spec/design.md`, `tasks/t-001-sharkbay-mvp-spec/design-review.md`, or this `contract.md` during the coding phase.

## 5. Done Criteria

- `npm install` or the chosen npm dependency setup has completed, and dependency files are committed to the allowed change set.
- `npm run dev` starts the Electron/Vite development app without immediate runtime failure.
- `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` exist and either pass or have exact, justified failures recorded in `implementation.md`.
- The app has a typed preload bridge and no renderer access to raw Node filesystem APIs.
- Configured roots can be added, listed, removed, persisted, and used by manual scan/refresh.
- Scanner detects manifest-backed harness repos and protocol-fallback repos under configured roots, skips ignored heavy directories, and reports unavailable roots without aborting the whole scan.
- The SharkBay repository is discoverable from a configured parent root and appears as project `SharkBay` using on-disk harness data, not a hard-coded path.
- Project summary displays name, path, detection mode, repo URL, branch, dirty state, active task, phase, gate status, and URL fields.
- Project detail displays queue sections, current task artifact text where available, parse/sync errors, revision tokens, recent decisions, review/evidence summaries where available, URL fields, and generated next-action prompt.
- URL editing writes through the safe harness writer to `.agent/state.json`, returns a new revision token, refreshes visible URL state, and refuses stale edits.
- Harness writer preserves unknown user-authored JSON fields and blocks invalid JSON, unsupported patch paths, schema failures, stale revisions, and symlink/path escape attempts without touching target files.
- Create-repo flow writes the bundled harness template set into an empty user-selected target directory and refuses non-empty targets or existing harness files.
- Prompt generator output includes repo path, task id, current phase, protocol reference, contract/check expectations, and an instruction not to rely on chat memory.
- Focused tests cover every critical behavior listed in section 7.
- `tasks/t-001-sharkbay-mvp-spec/implementation.md` records changed files, user-visible behavior, command evidence, known risks, and any checks that could not run with exact errors.

## 6. Required Checks

| Check | Command | Required |
| --- | --- | --- |
| Install dependencies | `npm install` | Yes, unless dependencies are already installed and the lockfile is current. |
| Typecheck | `npm run typecheck` | Yes |
| Lint | `npm run lint` | Yes |
| Unit tests | `npm test` | Yes |
| Build | `npm run build` | Yes |
| Development app smoke start | `npm run dev` | Yes, may be stopped after confirming the dev app starts. |
| Test coverage for focused logic | `npm test -- --coverage` | Preferred; required if coverage script is configured in this slice. |

Expected npm scripts:

```json
{
  "scripts": {
    "dev": "concurrently \"vite\" \"tsc -p tsconfig.node.json --watch\" \"wait-on tcp:5173 && electron .\"",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "test": "vitest run",
    "build": "tsc -p tsconfig.node.json && vite build"
  }
}
```

The implementer may adjust exact script internals to match the final scaffold, but the public script names above must exist unless they stop and record a contract issue.

## 7. Cross-Validation Requirements

For critical logic, automated tests must use temporary fixture directories and must assert both success behavior and refusal behavior. Manual UI checks may supplement these tests but do not replace them.

| Critical Behavior | Test/Script | Evidence Expected |
| --- | --- | --- |
| Configured-root containment | `npm test -- path-safety` or equivalent Vitest filter | Canonical child paths pass; sibling-prefix paths such as `SharkBay-other`, `..` traversal, unconfigured roots, and relative escape attempts fail. |
| Symlink escape prevention | `npm test -- path-safety` or equivalent | Symlinked repos, symlinked `.agent` directories, and symlinked target JSON files resolving outside the repo/root are rejected before read/write. |
| Scanner discovery | `npm test -- scanner` or equivalent | Manifest repos are detected as `manifest`; protocol-only repos are detected as `protocol-fallback`; `.git`, `node_modules`, build output, and hidden cache directories are skipped. |
| Self-host discovery | Unit fixture plus manual dev-app smoke evidence in `implementation.md` | A configured root containing `<repo-root>` yields project `SharkBay`, task `t-001-sharkbay-mvp-spec`, and the current phase from `.agent/queue.json`/state data. |
| Harness reader normalization | `npm test -- harness-reader` or equivalent | Missing/invalid JSON produces visible project errors without dropping the project; URL `unknown`, empty, and missing values normalize to `null`; manifest runtime URLs are fallback only. |
| Safe harness JSON writes | `npm test -- harness-writer` or equivalent | `.agent/state.json`, `.agent/manifest.json`, and `.agent/queue.json` typed patches update only allowlisted fields, preserve unknown keys, serialize with two-space JSON plus trailing newline, and return new revision tokens. |
| Stale write conflicts | `npm test -- harness-writer` or equivalent | Mismatched `expectedRevision` leaves the file unchanged and returns a conflict with latest parsed data/revision. |
| Invalid and unsupported writes | `npm test -- harness-writer` or equivalent | Invalid existing JSON, unsupported patch paths, schema validation failures, wrong target files, and symlinked harness files all fail without modifying the original file. |
| Atomic write behavior | `npm test -- harness-writer` or equivalent | Successful writes use temp sibling file plus rename; failure before rename leaves original file intact; post-write re-read matches returned data. |
| URL persistence | `npm test -- urls` or equivalent | State-file URL source of truth wins over manifest fallback; accepted schemes persist; whitespace becomes `null`; invalid schemes fail; stale URL edits fail. |
| Create-repo safety | `npm test -- template-installer` or equivalent | Empty target gets the expected `.agent/`, `docs/`, and `tasks/` files; non-empty target and existing harness files are refused. |
| Prompt generation | `npm test -- prompt-generator` or equivalent | Prompt includes repo path, task id, phase, protocol path, required checks, stop conditions, and instruction not to rely on chat memory. |
| Renderer IPC boundary | `npm test -- preload` or equivalent where practical, plus typecheck | Exposed API methods are typed and narrow; no generic arbitrary path read/write method is exposed. |
| Visual dashboard/detail smoke | Manual run recorded in `implementation.md` after `npm run dev` | Dashboard loads, configured root can be scanned, SharkBay appears, detail opens, URLs and generated prompt are visible, and no blocking renderer console/runtime error is observed. |

## 8. Stop Conditions

Stop and ask the user before continuing if:

- Any dependency task or phase lock blocks entry into coding.
- Coding requires changing files outside the allowed list.
- The scaffold requires a package manager other than npm or a materially different stack than Electron + React + TypeScript + Vite.
- A required check cannot be added or run, or the implementer wants to skip a required check.
- Safe JSON writes cannot satisfy revision-token conflict detection, unknown-key preservation, schema validation, path containment, or atomic-write requirements in this slice.
- Self-host discovery would require hard-coding `<repo-root>`.
- URL persistence cannot use `.agent/state.json` as the authoritative source.
- The renderer needs a generic filesystem API, shell execution API, or direct Codex invocation to satisfy the UI.
- Create-repo behavior would overwrite a non-empty directory or existing harness files.
- A destructive command, repository reset, force overwrite, production deployment, publishing step, secret access, billing operation, or external service credential is needed.
- Existing user or other-worker edits conflict with the coding slice in a way that cannot be merged safely.
