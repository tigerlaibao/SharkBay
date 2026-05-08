# Verification

## Commands

| Command | Exit | Evidence |
| --- | ---: | --- |
| `npm run typecheck` | 0 | Renderer and Node TypeScript projects completed successfully. |
| `npm test -- tests/dev-services.test.ts tests/scanner.test.ts` | 0 | 2 files passed, 15 tests passed. |
| `npm test` | 0 | 14 files passed, 86 tests passed. |
| `npm run build` | 0 | Vite built 37 modules and emitted renderer assets; existing chunk-size warning only. |
| `git diff --check` | 0 | No whitespace errors reported. |
| Built real-project probe | 0 | AIBF, AIGF, and ItsMyLife returned expected service labels and cwd values. |

## Real Project Probe Output

- `/Users/shark/Projects/AIBF`: `dev: next dev`
- `/Users/shark/Projects/AIGF`: `dev: next dev`, `dev: node src/server.js`
- `/Users/shark/Projects/ItsMyLife`: `dev:server`, `dev:web`

## Done Criteria

- Script-semantic labels are used instead of directory-name labels.
- Root `dev:*` scripts are discovered.
- Direct-child `scripts.dev` entries are discovered.
- Child services start from child package cwd.
