# Verification

## Commands

| Check | Exit | Evidence |
| --- | ---: | --- |
| `rg -n "is-shark-app|project-icon\\.is-default|terminal-header h3|terminal-layout|phase-pill|harness-pill" src/renderer/App.tsx src/styles/app.css` | 0 | Found scoped fallback icon treatment, bundled Shark avatar scaling, Night pill selectors, and Night terminal heading selectors. |
| `npm run typecheck` | 0 | TypeScript renderer and node projects completed with no errors. |
| `npm test` | 0 | 13 test files passed; 78 tests passed. |
| `npm run build` | 0 | Vite production build completed; existing chunk-size warning remains. |
| `git diff --check` | 0 | No whitespace errors. |

## Done Criteria Mapping

- Night pills are less visually loud: satisfied by Night-only translucent pill overrides for all current pill classes.
- Default project icon is readable in Night mode: satisfied by the fallback-only `is-default` class and Night-only image filter.
- Project icons fill the circular avatar better: satisfied by scaling fallback icons and known bundled Shark PNG project icons to 118% inside the clipped circle.
- Middle terminal title is readable in Night mode: satisfied by Night-only terminal layout and `terminal-header h3` color overrides.
- Existing themes are preserved: CSS selectors are scoped under `.app-shell[data-theme="night"]`.
