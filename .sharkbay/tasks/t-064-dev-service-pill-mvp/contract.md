# Contract

## Scope

- Discover a first-pass `dev` service from the selected project root `package.json` when it has `scripts.dev`.
- Surface the service as a pill button on the terminal header right side.
- Show a gray dot when stopped and a green dot when running.
- Clicking the stopped pill starts `npm run dev`, `pnpm dev`, or the appropriate package-manager command in a service-bound terminal tab.
- Clicking the running pill stops that service, closes the corresponding tab, and returns the dot to gray.

## Package Manager Command Rule

- If `packageManager` starts with `pnpm` or `pnpm-lock.yaml` exists: `pnpm dev`.
- Else if `packageManager` starts with `yarn` or `yarn.lock` exists: `yarn dev`.
- Else if `packageManager` starts with `bun` or `bun.lockb` exists: `bun run dev`.
- Else: `npm run dev`.

## Non-Goals

- No port or URL detection.
- No service editing UI.
- No saved run history.
- No monorepo/package scanning beyond the selected project root.
- No multiple discovered services beyond the root `dev` script.

## Implementation Plan

- Add a safe main-process service discovery helper that reads root `package.json` inside configured roots.
- Extend terminal session creation to optionally start an initial command and carry service metadata.
- Extend renderer terminal state so a service maps to one terminal tab and can be started/stopped from a pill.
- Style the service pill in the terminal header with stopped/running dots.

## Verification

- Focused tests for service discovery and terminal initial-command metadata.
- `npm run typecheck`
- `npm test`
- `npm run build`
- `git diff --check`

## Gate

- Design/contract gate: blocker=0, major=0. The MVP intentionally avoids URL detection and service persistence to keep the first slice small.
