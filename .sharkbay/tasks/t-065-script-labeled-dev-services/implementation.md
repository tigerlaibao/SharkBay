# Implementation

## Changes

- Extended dev service discovery from root-only `scripts.dev` to:
  - root `scripts.dev`
  - root scripts starting with `dev:`
  - direct-child `package.json` files with `scripts.dev`
- Labeled services by script semantics:
  - root `dev:*` keeps the script key, such as `dev:server`
  - `dev` uses `dev: <script value>`, such as `dev: next dev`
- Added per-service `cwd` so child-package service tabs start from the package directory.
- Updated renderer service launch to use `service.cwd`.
- Updated service discovery and scanner tests.

## Files

- `src/main/dev-services.ts`
- `src/shared/types.ts`
- `src/renderer/types.ts`
- `src/renderer/workflow.ts`
- `src/renderer/App.tsx`
- `tests/dev-services.test.ts`
- `tests/scanner.test.ts`

## Real Project Probe

Built discovery output now finds:

- AIBF: `dev: next dev`
- AIGF: `dev: next dev`, `dev: node src/server.js`
- ItsMyLife: `dev:server`, `dev:web`
