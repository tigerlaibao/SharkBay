# Implementation

## Summary

Implemented runtime-derived terminal tab titles:

- Ordinary shell tabs now display the current directory relative to the terminal's project root. The project root itself is shown as `.`.
- Foreground non-shell commands now take over the tab title. If SharkBay captured the submitted command line, it uses that full line, such as `pnpm dev:server`; otherwise it falls back to the PTY foreground process name, such as `top`.
- Terminal title changes are pushed from the main process through a new `terminal:update` IPC event and applied to the matching renderer tab.

## Files Changed

- `src/main/terminal.ts`
  - Added title derivation helpers, command-line input tracking, foreground-process detection, cwd polling, and update emission.
  - Added safe process cwd inspection through `/proc/<pid>/cwd` on Linux and `lsof -a -p <pid> -d cwd -Fn` on macOS.
  - Ensured closed sessions do not emit stale title updates.
- `electron/ipc.ts`, `electron/preload.mts`
  - Added `terminal:update` forwarding and preload subscription support.
- `src/shared/types.ts`, `src/renderer/types.ts`
  - Added `TerminalUpdateEvent`.
- `src/renderer/App.tsx`
  - Subscribed to terminal update events and replaced the matching tab session state.
- `tests/terminal.test.ts`
  - Added focused coverage for title derivation and command-line capture.
  - Updated session creation expectation from project name to `.`.

## User-Visible Behavior

Terminal tabs no longer stay named after the project. A tab at project root shows `.`, subdirectories show paths such as `src/main`, and occupying commands can show titles such as `top`, `codex`, `claude`, or `pnpm dev:server`.

## Known Risks

- Command-line capture reflects text typed or pasted into SharkBay's terminal. Commands launched entirely from shell history may fall back to the foreground process name.
- Cwd polling depends on platform support. macOS uses `lsof`; if inspection fails, the previous known cwd remains.
