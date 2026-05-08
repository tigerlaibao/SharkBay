# t-050-project-icons Implementation

## Changes

- Added `src/main/project-icons.ts` to resolve ordered icon candidates:
  - local app icons from `package.json build.mac.icon` / `build.icon`
  - common local icon paths such as `resources/icon.png`, `public/favicon.*`, `app/icon.png`, and `src-tauri/icons/128x128.png`
  - favicon URLs derived from project-authored local/test/deployment URLs
- Added `iconSources` to `ProjectSummary` and `ProjectCandidate` so both managed and not-setup rows can display project identity.
- Local icon files are returned as data URLs after path-safety checks, avoiding raw filesystem authority in the renderer.
- Copied `~/Downloads/shark-fin.png` to `src/renderer/assets/shark-fin.png` as the renderer fallback icon.
- Added a fixed-size circular icon surface to the left project rows with per-image fallback handling.
- Added scanner tests for managed app icon preference, favicon candidates, and not-setup local icons.

## Runtime Icon Strategy

The runtime does not crawl the web or write an icon cache. It returns a small ordered list of candidates. The renderer tries them in order and falls back to the bundled shark fin when an image fails:

1. local app icon data URL
2. direct site favicon/touch icon URL
3. external favicon service for non-localhost domains
4. bundled shark fin asset

## Files Changed

- `src/main/project-icons.ts`
- `src/main/harness-reader.ts`
- `src/main/scanner.ts`
- `src/shared/types.ts`
- `src/renderer/types.ts`
- `src/renderer/workflow.ts`
- `src/renderer/App.tsx`
- `src/styles/app.css`
- `src/renderer/assets/shark-fin.png`
- `tests/scanner.test.ts`
