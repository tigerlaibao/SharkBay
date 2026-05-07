# Spec

## Scope

- Replace child-process pipe terminal sessions with `node-pty`.
- Replace the custom `<pre>` output and command input UI with `@xterm/xterm`.
- Use `@xterm/addon-fit` for resize and `@xterm/addon-web-links` for links.
- Keep one terminal space per selected project candidate.
- Each terminal space supports multiple tabs.
- Switching projects shows only that project's terminal space in the far-right column.
- Hidden project terminal spaces and their sessions remain running.
- Continue validating terminal cwd against configured roots in the main process.

## Non-Goals

- Split panes.
- Persistent terminal restoration across app restarts.
- Sharing terminal tabs across projects.
- Running terminals outside configured roots.

## Acceptance Criteria

- Selecting project A opens/focuses project A's terminal space; selecting project B opens/focuses project B's separate terminal space.
- Returning to project A shows its previous tabs and running sessions.
- Creating a new tab adds it only to the current project's terminal space.
- Hidden project terminal sessions continue running until closed or app quit.
- Terminal uses PTY behavior suitable for interactive CLIs.
- Required automated checks pass.
