# Implementation

## Summary

Implemented the terminal integration as a first-class SharkBay workbench column.

- Removed the old always-visible far-left navigation sidebar.
- Reworked the dashboard into project list, task/detail pane, and terminal pane.
- Added terminal tab state in the renderer with automatic focus/open behavior for the selected project candidate.
- Added terminal IPC and preload APIs for create/input/resize/close plus data and exit events.
- Added a main-process `TerminalManager` that validates cwd against configured roots before spawning.
- Started the user's login shell directly through Electron-owned pipes.
- Added app shutdown cleanup for terminal child processes.
- Added terminal cwd validation and create/close tests.

## User-Visible Behavior

Selecting a managed or not-setup project opens or focuses a terminal tab rooted at that project path. Users can create additional tabs, close tabs, run commands, and send `Ctrl+C` through the terminal input.

## Known Limits

- This is a lightweight terminal surface, not a full xterm-compatible emulator.
- ANSI color rendering, split panes, and full keyboard terminal behavior remain future work.
- The first implementation attempted to use macOS `/usr/bin/script` as a pseudo-terminal wrapper, but `script` fails under Electron's piped child-process stdio with `tcgetattr/ioctl: Operation not supported on socket`; this wrapper is now removed.
- Interactive shell mode also triggers macOS zsh session restore TTY reads under piped stdio, so SharkBay now starts a non-interactive login shell and disables Apple shell session restore for terminal child processes.
- Browser smoke verification cannot exercise preload terminal IPC because the plain Vite browser lacks Electron's `window.sharkBay` bridge.

## Checks Run

- `npm run typecheck`
- `npm test`
- `npm run build`
- `git diff --check`
- Browser smoke at `http://127.0.0.1:5173/`
