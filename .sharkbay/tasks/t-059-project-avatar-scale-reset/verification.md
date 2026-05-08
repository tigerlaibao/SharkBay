# Verification

## Commands

| Check | Exit | Evidence |
| --- | ---: | --- |
| `rg -n "108%|project-icon\\.is-default img|project-icon\\.is-shark-app img" src/styles/app.css` | 0 | No `108%` or generic avatar scale override remains; only the Night fallback icon filter selector remains. |
| `npm run typecheck` | 0 | TypeScript renderer and node projects completed with no errors. |
| `npm test` | 0 | 13 test files passed; 78 tests passed. |
| `npm run build` | 0 | Vite production build completed; existing chunk-size warning remains. |
| `git diff --check` | 0 | No whitespace errors. |

## Done Criteria Mapping

- Restore project avatar image scale to 100%: satisfied by removing the fallback/Shark image scale override.
- Preserve Night color/filter fixes: satisfied because `.app-shell[data-theme="night"] .project-icon.is-default img` remains.

