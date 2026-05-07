# Verification

## Result

Verification passed.

## Evidence

| Command | Exit | Evidence |
| --- | ---: | --- |
| `npm test -- tests/scanner.test.ts tests/harness-reader.test.ts tests/harness-writer.test.ts tests/template-installer.test.ts tests/harness-template-sync.test.ts tests/prompt-generator.test.ts tests/self-host-workflow.test.ts` | 0 | Vitest reported 7 files and 46 tests passed. |
| `npm run typecheck` | 0 | `tsc -p tsconfig.renderer.json --noEmit && tsc -p tsconfig.node.json --noEmit` completed. |
| `npm test` | 0 | Vitest reported 11 files and 65 tests passed. |
| `npm run build` | 0 | `tsc -p tsconfig.node.json && vite build` completed; Vite built 36 modules and emitted the existing chunk-size warning. |
| `git diff --check` | 0 | Completed with no whitespace errors. |

## Done Criteria Mapping

| Criterion | Evidence |
| --- | --- |
| New setup writes root `AGENTS.md` plus `.sharkbay/**` | `tests/template-installer.test.ts` verifies returned files include `.sharkbay/manifest.json` and exclude root `.agent`, root `docs`, root `tasks`, and `.gitignore`. |
| Legacy projects remain readable and writable | `tests/harness-reader.test.ts`, `tests/harness-writer.test.ts`, `tests/self-host-workflow.test.ts`, and legacy sync coverage passed. |
| Contained projects are readable and writable | Contained reader, writer, scanner, prompt, and template installer tests passed. |
| Mixed projects prefer contained layout | `tests/harness-reader.test.ts` contains a mixed-layout precedence test. |
| Template sync only touches version-owned files | `tests/harness-template-sync.test.ts` verifies project-owned state/docs/gitignore preservation and legacy target paths. |
| No setup-owned `.gitignore` mutation | `tests/template-installer.test.ts` verifies `.gitignore` is not created and an existing `.gitignore` is preserved. |

## Residual Risk

Old installed legacy files are intentionally not cleaned up in this task. Cleanup remains deferred to `t-039-legacy-harness-file-cleanup`.
