# Implementation

## Summary

Implemented confirmation-gated Ripple setup for existing project directories.

## Changes

| File | Change |
| --- | --- |
| `src/shared/types.ts` | Added `allowExistingDirectory` to `CreateHarnessRepoInput` and a `file-collision` failure reason. |
| `src/renderer/types.ts` | Mirrored the optional create input flag for the preload bridge. |
| `src/main/template-installer.ts` | Kept non-empty target refusal as the default, added explicit existing-directory setup, preflighted all template file paths, and preserved no-overwrite behavior. |
| `src/renderer/App.tsx` | Replaced the not-setup placeholder with a two-step setup confirmation UI wired to `createHarnessRepo`. |
| `src/styles/app.css` | Added compact confirmation layout support. |
| `tests/template-installer.test.ts` | Added coverage for existing-directory setup, existing harness refusal, collision preflight, runtime root authority, and outside-root rejection. |

## Safety Notes

- Existing directories are accepted only when the caller passes `allowExistingDirectory: true`.
- Template target paths are fully preflighted before any files are written, so collisions do not leave partial installs.
- Existing `.agent` still blocks setup.
- Runtime IPC still reads configured roots from persisted app config.

## Evidence

| Command | Result |
| --- | --- |
| `npm test -- tests/template-installer.test.ts` | pass, 6 tests |
| `npm run typecheck` | pass |
| `npm test` | pass, 34 tests |
| `npm run build` | pass |
| `git diff --check` | pass |
