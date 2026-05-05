# Implementation

## Summary

Implemented the first read-only developer metadata slice.

## Changes

| File | Change |
| --- | --- |
| `src/shared/types.ts` | Added development metadata types and `ProjectDetail.development`. |
| `src/shared/schema.ts` | Added validation and normalization for partial `.agent/development.json`. |
| `src/main/harness-reader.ts` | Reads optional `.agent/development.json`, ignores missing files, reports invalid metadata as diagnostics. |
| `src/renderer/types.ts` | Mirrored development metadata types for the renderer. |
| `src/renderer/App.tsx` | Added a read-only `Project Info` summary card for stack, links, commands, ports, and tools. |
| `src/styles/app.css` | Added compact project info chip styles. |
| `templates/harness/.agent/development.json` | Added starter metadata file for new Ripple setups. |
| `templates/harness/.agent/manifest.json` | Added `files.development`. |
| `.agent/development.json` | Dogfooded SharkBay's own developer metadata. |
| `.agent/manifest.json` | Indexed `.agent/development.json`. |
| `.agent/protocol.md` | Added Developer Metadata Discipline. |
| `tests/helpers.ts` and `tests/harness-reader.test.ts` | Added fixture data and coverage for valid, missing, and invalid metadata. |

## Notes

- No writer expansion was added.
- Missing development metadata is treated as normal.
- Invalid metadata shows as diagnostics instead of blocking project load.
- UI hides absent metadata and sentinel values.

## Evidence

| Command | Result |
| --- | --- |
| `npm run typecheck` | pass |
| `npm test -- tests/harness-reader.test.ts` | pass, 6 tests |
| `npm test` | pass, 36 tests |
| `npm run build` | pass |
| `git diff --check` | pass |
