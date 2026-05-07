# Spec

## Scope

- Remove the app's far-left navigation sidebar from the dashboard shell.
- Keep project selection as the left workbench column.
- Keep the task/project detail column in the middle.
- Add a new far-right Terminal column.
- When a managed or not-setup project is selected, create or focus a terminal tab whose working directory is that project's real path.
- Support multiple terminal tabs, with close and new-tab controls.
- Stream shell output into the UI and send user-entered input to the active terminal session.
- Allow long-running project services and CLI tools to keep running while the user changes selected projects or tabs.

## Non-Goals

- Split panes.
- Full terminal emulation, ANSI color rendering, or xterm-level keyboard support.
- Direct background automation policy changes.
- Writing to project harness files from the terminal feature.

## Acceptance Criteria

- The app no longer renders the old far-left sidebar.
- The dashboard has project list, task/detail pane, and terminal pane as the visible workbench.
- Selecting a project opens a terminal tab with `cwd` set to the selected project path, including not-setup projects.
- Terminal tabs can be created, selected, and closed.
- Terminal input is sent to the active process and output appears in the tab.
- Terminal IPC validates the requested working directory against configured roots before spawning.
