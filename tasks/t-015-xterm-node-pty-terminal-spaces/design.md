# Design

## Runtime

Use `node-pty` in `src/main/terminal.ts`.

- `TerminalManager.create` resolves and validates cwd through configured roots.
- `node-pty.spawn(shell, ["-l"], { cwd, cols, rows, env })` starts the session.
- `terminal.input` writes directly to the PTY.
- `terminal.resize` calls `pty.resize(cols, rows)`.
- `terminal.close` kills only SharkBay-owned PTY sessions.

## Renderer

Use `@xterm/xterm` in `TerminalPane`.

- The renderer owns terminal spaces keyed by project candidate id.
- Each space stores its project path/name, tabs, and active tab id.
- Each tab stores the Electron session metadata, `Terminal`, `FitAddon`, and disposables.
- All project spaces stay mounted, but only the selected project's space is visible.
- All tabs inside a space stay mounted, but only the active tab surface is visible.
- xterm `onData` sends input through terminal IPC.
- IPC data events call `terminal.write`.
- `FitAddon` computes dimensions and sends `terminal.resize` to the main process.

## Safety

The renderer may request a cwd, but the main process is the authority. The terminal manager loads configured roots from runtime config and rejects cwd values outside those roots.

## Risks

- `node-pty` is a native module and must be rebuilt for Electron.
- Hidden xterm instances need explicit fit calls when they become visible.
- Electron dev startup may fail if native rebuild has not completed.
