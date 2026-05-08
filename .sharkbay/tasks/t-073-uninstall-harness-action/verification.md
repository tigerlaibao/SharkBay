# T-073 Verification

## Checks

| Check | Exit | Evidence |
| --- | ---: | --- |
| `npm test -- tests/harness-uninstall.test.ts` | 0 | `tests/harness-uninstall.test.ts (4 tests)` passed. |
| `npm run typecheck` | 0 | Renderer and node TypeScript projects completed with no errors. |
| `npm test` | 0 | 15 test files and 93 tests passed. |
| `npm run build` | 0 | TypeScript and Vite build completed; Vite reported the existing chunk-size warning. |
| `git diff --check` | 0 | No whitespace errors reported. |

## Done Criteria Mapping

- Context menu UI on project rows: satisfied by `ProjectTable` Managed-row `onContextMenu` and the rendered `project-context-menu`.
- User confirmation: satisfied by `window.confirm` before calling `uninstallHarness`.
- Backend IPC removes recognized harness files: satisfied by `src/main/harness-uninstall.ts`, IPC/preload wiring, and focused tests.
- `.gitignore` cleanup preserves unrelated lines: satisfied by exact-pattern cleanup tests and full focused uninstall fixtures.
- Safety refusal for outside roots and symlinks: satisfied by focused unsafe path and nested symlink tests.
- Verification evidence recorded: this file records command names, exits, and output excerpts.

## Result

Verification passed.
