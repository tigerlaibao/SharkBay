# Verification

## Commands

| Check | Exit | Evidence |
| --- | ---: | --- |
| `rg -n "108%|project-section-title span|queue-priority|info-chip|runtime-link.info-chip" src/styles/app.css` | 0 | Found adjusted avatar scale and scoped Night styles for project counts, priority badges, Info chips, and runtime links. |
| `npm run typecheck` | 0 | TypeScript renderer and node projects completed with no errors. |
| `npm test` | 0 | 13 test files passed; 78 tests passed. |
| `npm run build` | 0 | Vite production build completed; existing chunk-size warning remains. |
| `git diff --check` | 0 | No whitespace errors. |

## Done Criteria Mapping

- Night priority badges are less loud: satisfied by `.app-shell[data-theme="night"] .queue-priority`.
- Night Info chips are less loud: satisfied by `.app-shell[data-theme="night"] .info-chip` and `.runtime-link.info-chip`.
- Managed/Not setup count bubbles match Night mode: satisfied by `.app-shell[data-theme="night"] .project-section-title span`.
- Avatar scale is more refined: satisfied by reducing fallback/bundled Shark avatar image scale from 118% to 108%.

