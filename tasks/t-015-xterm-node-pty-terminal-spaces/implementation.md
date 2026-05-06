# Implementation

## Summary

Replaced the temporary pipe terminal with a PTY-backed xterm terminal.

- Added `@xterm/xterm`, `@xterm/addon-fit`, `@xterm/addon-web-links`, `node-pty`, and `@electron/rebuild`.
- Added `npm run rebuild:native` and a postinstall rebuild path for `node-pty`.
- Added `scripts/fix-node-pty-permissions.mjs` because the installed macOS `spawn-helper` did not have executable permissions.
- Reworked `src/main/terminal.ts` to use `node-pty.spawn`, `pty.write`, `pty.resize`, and `pty.kill`.
- Reworked the renderer terminal column to use xterm instances instead of a custom `<pre>` and command input.
- Changed terminal UI state from global tabs to project-scoped terminal spaces.
- Kept inactive project spaces mounted but hidden so their tabs and PTY sessions continue running while another project is selected.
- Added xterm fit and web-links addons.

## Dependency Notes

The first install hit npm 11's `Invalid Version:` error because the existing lockfile contained old optional dependency entries with no version under esbuild/rollup nested optional packages. The invalid optional entries were removed mechanically from `package-lock.json`, after which npm installed dependencies and regenerated a valid hidden lock.

## User-Visible Behavior

Each selected project owns its own terminal space. Switching projects switches the visible terminal space, not the tab list. Creating a new tab adds it only to the current project's space. Hidden sessions stay alive until their tab is closed or the app exits.

## Checks Run

- `npm run rebuild:native`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `git diff --check`
- Browser layout smoke at `http://127.0.0.1:5173/`
