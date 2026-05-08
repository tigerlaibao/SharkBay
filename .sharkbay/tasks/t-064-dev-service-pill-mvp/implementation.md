# Implementation

## Changes

- Added root `package.json` `scripts.dev` discovery for project candidates.
- Added package-manager-aware dev command selection for npm, pnpm, yarn, and bun.
- Extended terminal sessions with optional service metadata and an initial command.
- Added service pill controls to the terminal header.
- Bound running service state to a service terminal tab; stopping or process exit removes the service tab.

## Files

- `src/main/dev-services.ts`
- `src/main/scanner.ts`
- `src/main/terminal.ts`
- `src/shared/types.ts`
- `src/renderer/types.ts`
- `src/renderer/workflow.ts`
- `src/renderer/App.tsx`
- `src/styles/app.css`
- `tests/dev-services.test.ts`
- `tests/scanner.test.ts`
- `tests/terminal.test.ts`

## Notes

- This slice intentionally discovers only one root `dev` service.
- No URL detection, service editing, persisted run history, or monorepo script scanning was added.
