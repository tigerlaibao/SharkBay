# Implementation

## Changes

- Added `src/main/harness-layout.ts` with contained and legacy harness layout maps.
- Updated scanner discovery to detect `.sharkbay/` first while preserving `.agent/` and protocol fallback support.
- Updated harness reader paths for manifest/state/queue, development metadata, runner metadata, task directory fallback, and task artifacts through the resolved layout.
- Kept writer APIs logically compatible while resolving physical writes to the active project layout, so contained projects write `.sharkbay/state.json` and legacy projects still write `.agent/state.json`.
- Made template sync layout-aware: contained projects sync `AGENTS.md`, `.sharkbay/protocol.md`, `.sharkbay/quality-rules.md`, and `.sharkbay/template-sync.json`; legacy projects keep legacy target paths.
- Moved bundled harness templates under `templates/harness/.sharkbay/`, retained root `AGENTS.md`, and removed the setup-seeded `.gitignore`.
- Updated setup copy, prompt generation, public docs, and tests for contained and legacy layouts.
- Added initial task guidance that target project agents own any `.gitignore` decision.

## Compatibility

- SharkBay's own local dogfood harness remains in the legacy `.agent`/root `tasks` layout and is not migrated by this task.
- Existing legacy managed projects remain readable, writable, prompt-generatable, and template-syncable.
- Mixed layouts prefer `.sharkbay/`.

## Check Evidence

| Command | Exit | Evidence |
| --- | ---: | --- |
| `npm test -- tests/scanner.test.ts tests/harness-reader.test.ts tests/harness-writer.test.ts tests/template-installer.test.ts tests/harness-template-sync.test.ts tests/prompt-generator.test.ts tests/self-host-workflow.test.ts` | 0 | 7 files and 46 tests passed. |
| `npm run typecheck` | 0 | Renderer and Node TypeScript projects completed. |
| `npm test` | 0 | 11 files and 65 tests passed. |
| `npm run build` | 0 | Node compile and Vite production build completed; Vite reported the existing large chunk warning. |
| `git diff --check` | 0 | No whitespace errors. |
