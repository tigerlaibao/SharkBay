# Design

## Behavior

The dashboard becomes a three-column workbench:

1. Projects column: existing filter and managed/not-setup project rows.
2. Tasks/detail column: the existing project detail, setup flow, and task drilldown.
3. Terminal column: a persistent terminal panel with tabs.

Selecting a project calls the terminal panel with the selected candidate path. The panel reuses an existing tab for that path when available; otherwise it creates a new terminal session. New tabs default to the selected candidate path.

## Runtime Model

Add a main-process terminal service that owns child processes by session id.

- `terminal:create` validates `cwd` using the app's configured roots and starts a shell there.
- `terminal:input` writes raw input to the session stdin.
- `terminal:resize` is a no-op placeholder for future PTY integration.
- `terminal:close` kills the child process.
- `terminal:data` streams stdout/stderr to the renderer.
- `terminal:exit` reports process exit.

On macOS, use `/usr/bin/script` when available to allocate a pseudo-terminal for better CLI behavior. Fall back to spawning the user's shell directly if the PTY wrapper cannot be used.

## UI

The terminal UI is deliberately utilitarian:

- Tab strip with cwd labels, new-tab button, close buttons, and status dots.
- Scrollback output in a monospace surface.
- Single command input that sends text plus newline.
- `Ctrl+C` sends interrupt to the active terminal.

## Safety

- Renderer-supplied `cwd` is never trusted as authority.
- The main process loads configured roots from runtime config, canonicalizes the requested directory, and rejects paths outside configured roots.
- Closing a terminal kills only its owned process.
- Terminal output is displayed as text, not HTML.

## Files Likely to Change

- `src/main/terminal.ts`
- `electron/ipc.ts`
- `electron/preload.mts`
- `src/shared/types.ts`
- `src/renderer/sharkbay-api.d.ts`
- `src/renderer/App.tsx`
- `src/styles/app.css`
- `tests/terminal.test.ts`

## Risks

- A minimal in-house terminal surface will not match a full emulator.
- Interactive CLIs vary in their TTY requirements; the macOS `script` wrapper improves this but is not equivalent to bundling `node-pty` and `xterm.js`.
- Long-running services can produce large output, so renderer scrollback should be capped.
