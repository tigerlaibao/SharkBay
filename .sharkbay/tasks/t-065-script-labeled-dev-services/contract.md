# Contract

## Scope

- Discover root `package.json` scripts whose names are `dev` or start with `dev:`.
- Discover direct-child `package.json` files with `scripts.dev`.
- Label root `dev:*` services with the full script key, such as `dev:server` and `dev:web`.
- Label `dev` services as `dev: <script value>`, such as `dev: next dev`.
- Start child-package services from the child package directory.

## Non-Goals

- No URL or port detection.
- No service editing UI.
- No persisted run history.
- No deep monorepo package scanning beyond direct child directories.

## Verification

- Focused service discovery tests for root `dev:*` and direct child `dev`.
- Focused scanner test covering the AIBF/AIGF/ItsMyLife-style shapes.
- `npm run typecheck`
- `npm test`
- `npm run build`
- `git diff --check`

## Gate

- Design/contract gate: blocker=0, major=0. The scope only broadens discovery and labels without adding new runtime authority.
