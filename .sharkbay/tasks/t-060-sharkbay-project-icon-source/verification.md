# Verification

## Commands

| Check | Exit | Evidence |
| --- | ---: | --- |
| `sed -n '1,36p' src/main/project-icons.ts` | 0 | `commonIconPaths` starts with `resources/project-icon.png` and contains no branded `resources/shark*` project-avatar paths. |
| `identify -format ... resources/project-icon.png` | 0 | `project-icon.png` is `512x512 srgba`; top-middle edge is opaque, unlike the padded macOS app-icon resources. |
| `rg -n "resources/shark|resources/project-icon|shark-morning|shark-day|shark-night" src/main/project-icons.ts .sharkbay/tasks/t-060-sharkbay-project-icon-source` | 0 | Product code hit only `resources/project-icon.png`; branded app icon names appear only in task documentation text. |
| `npm run typecheck` | 0 | TypeScript renderer and node projects completed with no errors. |
| `npm test` | 0 | 13 test files passed; 79 tests passed, including project icon priority coverage. |
| `npm run build` | 0 | Vite production build completed; existing chunk-size warning remains. |
| `git diff --check` | 0 | No whitespace errors. |

## Done Criteria Mapping

- Avoid SharkBay hardcoding: satisfied by removing branded app-icon filenames from generic project-avatar discovery and using a semantic `resources/project-icon.png` convention.
- Keep Dock icons unchanged: satisfied because Electron runtime icon wiring still uses the themed app icons.
- Make SharkBay project avatar fill normally: satisfied because `resources/project-icon.png` is sourced from the full 512px project artwork, not the padded 1024px app icon.

