# Implementation

## Plan

- Treat root `.gitignore` as a setup seed, not a required collision-free harness file, when `allowExistingDirectory` is true.
- Preserve all other collision behavior so setup remains no-overwrite for existing project files.
- Add a focused regression test proving `.gitignore` is preserved and omitted from written files.

## Changes

- Updated `src/main/template-installer.ts` so `copyTemplateTree` can skip explicitly allowed setup-seed files when they already exist.
- Passed root `.gitignore` as the only skippable seed file for `allowExistingDirectory` setup.
- Added a regression test in `tests/template-installer.test.ts` that preserves an existing `.gitignore`, omits it from the written-file result, and still installs harness files.
