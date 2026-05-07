# Implementation

## Changes

- Added `templates/harness/AGENTS.md` as a root Codex/Ripple onboarding entrypoint for newly created or setup-managed projects.
- Updated template installer tests to assert successful setup writes `AGENTS.md` and existing-project setup refuses to overwrite a pre-existing root `AGENTS.md` without partial harness writes.
- Updated the self-host prompt workflow test to match the current concise handoff contract: prompts point to `AGENTS.md` and protocol files without inlining check or stop-condition lists.

## User-Visible Behavior

- New managed projects created from the bundled harness template include root `AGENTS.md`.
- Existing-project Ripple setup includes `AGENTS.md` when no root file conflicts.
- Existing-project Ripple setup with a pre-existing `AGENTS.md` returns `file-collision` and preserves the local file.
- Generated next-action prompts continue to direct agents to `AGENTS.md`, harness files, autonomous phase progression, subagents, mirror synchronization, required checks, and checkpoint commits.

## Known Risks

- Existing projects with their own `AGENTS.md` still require a manual merge before setup can install the full template. This is intentional for the first no-overwrite slice.
- Existing managed projects are not migrated automatically; the new template file applies to future setup/create operations.

## Check Evidence

| Command | Exit | Evidence |
| --- | ---: | --- |
| `npm test -- tests/template-installer.test.ts tests/prompt-generator.test.ts tests/self-host-workflow.test.ts` | 0 | Vitest reported 3 files and 12 tests passed. |
| `npm run typecheck` | 0 | `tsc -p tsconfig.renderer.json --noEmit && tsc -p tsconfig.node.json --noEmit` completed. |
| `npm test` | 0 | Vitest reported 8 files and 38 tests passed. |
| `git diff --check` | 0 | Completed with no whitespace errors. |
| `npm run lint` | 0 | Lint delegates to `npm run typecheck`; both TypeScript projects completed. |
| `npm run build` | 0 | Node compile and Vite production build completed; Vite built 32 modules. |
| `npm run dev` | 1 | Vite failed with `Error: Port 5173 is already in use`; concurrently terminated watch/electron subprocesses. |
| `lsof -nP -iTCP:5173 -sTCP:LISTEN` | 0 | Found `node` listeners on `127.0.0.1:5173` and `[::1]:5173`. |
| `curl -I http://127.0.0.1:5173` | 0 | Existing dev server returned `HTTP/1.1 200 OK`. |
