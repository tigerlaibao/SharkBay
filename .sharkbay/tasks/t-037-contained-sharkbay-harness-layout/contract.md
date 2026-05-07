# Implementation Contract

## Goal

Implement contained `.sharkbay/` harness setup for new projects while preserving legacy `.agent`/root `docs`/root `tasks` compatibility for existing projects, including SharkBay's own local dogfood harness.

## Ownership

| Area | Responsibility |
| --- | --- |
| `src/main/harness-layout.ts` | New layout resolver and logical path maps. |
| `src/main/scanner.ts` | Detect contained and legacy projects. |
| `src/main/harness-reader.ts` | Read JSON, metadata, runner, task directories, and artifacts through the resolved layout. |
| `src/main/path-safety.ts`, `src/main/harness-writer.ts`, `src/shared/types.ts` | Make harness JSON writes layout-aware without weakening path safety. |
| `src/main/harness-template-sync.ts` | Sync version-owned files for contained and legacy layouts. |
| `src/main/template-installer.ts`, `templates/harness/**` | Install contained layout for new/setup projects. |
| `src/main/prompt-generator.ts`, `src/renderer/App.tsx`, docs/tests | Update user and agent surfaces. |

## Required Behavior

- New setup writes root `AGENTS.md` plus `.sharkbay/**`.
- New setup does not write root `.agent`, root `docs`, or root `tasks`.
- Existing legacy projects remain scan-visible, detail-readable, prompt-generatable, and URL-writable.
- Contained projects are scan-visible, detail-readable, prompt-generatable, and URL-writable.
- Mixed projects prefer contained layout.
- Existing `.agent` or `.sharkbay` in a setup target is treated as existing harness state.
- Template sync does not overwrite project-owned manifest/state/queue/development/docs/tasks data.

## Required Checks

- `npm test -- tests/scanner.test.ts tests/harness-reader.test.ts tests/harness-writer.test.ts tests/template-installer.test.ts tests/harness-template-sync.test.ts tests/prompt-generator.test.ts tests/self-host-workflow.test.ts`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `git diff --check`

## Stop Conditions

- Any change requires moving or rewriting SharkBay's local `.agent`, root `tasks`, `docs/task.md`, or `docs/learnings.md`.
- Any write path can escape configured roots or follow symlinks.
- Any setup path silently overwrites project files.
- Any template sync path touches project-owned state/history files.
