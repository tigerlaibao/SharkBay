# Implementation Contract

## Files Allowed

- `src/main/legacy-harness-cleanup.ts`
- `src/main/harness-reader.ts`
- `src/shared/types.ts`
- `src/renderer/types.ts`
- `src/renderer/App.tsx`
- `electron/ipc.ts`
- `electron/preload.ts`
- `tests/legacy-harness-cleanup.test.ts`
- focused docs if behavior needs public explanation

## Required Behavior

- Migration is explicit and confirmation-gated in the UI.
- Scan/detail reads may report cleanup status but must not mutate files.
- Migration refuses mixed layouts, destination conflicts, symlinked sources, and unsafe task directories.
- Migration moves only recognized legacy harness files into `.sharkbay/`.
- Root `AGENTS.md` and `.gitignore` are untouched.
- Unrelated project root `docs/` and `tasks/` content remains in place.

## Verification Plan

- Focused cleanup tests.
- Focused existing layout/template tests to catch T037 regressions.
- `npm run typecheck`
- `npm test`
- `npm run build`
- `git diff --check`
