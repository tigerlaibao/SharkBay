# Implementation Contract

## Goal

Implement the first project-authored developer metadata slice:

- add `.agent/development.json` as an optional harness metadata file
- read and normalize it safely
- show a read-only `Project Info` summary in the right project detail pane
- update templates and protocol so future project agents maintain it

## Files

| File | Responsibility |
| --- | --- |
| `src/shared/types.ts` | Add developer metadata types and project detail field. |
| `src/shared/schema.ts` | Validate/normalize partial development metadata. |
| `src/main/harness-reader.ts` | Read optional `.agent/development.json` without breaking old projects. |
| `src/renderer/types.ts` | Mirror metadata types for the renderer. |
| `src/renderer/App.tsx` | Add read-only `Project Info` summary card. |
| `src/styles/app.css` | Add compact metadata card/list styles. |
| `templates/harness/.agent/manifest.json` | Add `files.development`. |
| `templates/harness/.agent/development.json` | Add starter metadata file. |
| `.agent/manifest.json` and `.agent/development.json` | Dogfood the new metadata for SharkBay itself. |
| `.agent/protocol.md` | Add developer metadata discipline. |
| `tests/harness-reader.test.ts` | Cover metadata reading and missing/invalid compatibility. |

## Required Behavior

- Existing projects without `.agent/development.json` load normally.
- Invalid metadata records diagnostics but does not block project display.
- Unknown/sentinel/empty values are suppressed from UI.
- Overview shows useful present facts only.
- No manual metadata editing UI is added.
- No writer expansion is added in this slice.

## Required Checks

- `npm run typecheck`
- `npm test -- tests/harness-reader.test.ts`
- `npm test`
- `npm run build`
- `git diff --check`

## Stop Conditions

- Metadata read path can escape configured roots.
- UI shows empty/unknown placeholder fields.
- Implementation requires a broad manifest/state writer.
