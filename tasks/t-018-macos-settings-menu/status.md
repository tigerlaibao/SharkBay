# t-018-macos-settings-menu

## Status

- Phase: done
- Gate: passed
- Owner: Codex
- Started: 2026-05-06
- Completed: 2026-05-06

## Goal

Make Settings reachable from the macOS application menu and remove the project-list top controls from the left column.

## Acceptance Criteria

- The macOS app menu includes a `Settings...` item.
- Choosing `Settings...` focuses the main window and opens the existing Settings view.
- The project-list top search, phase, Dirty, Blocked, refresh, and Settings controls are removed from the left column.
- The project list is not filtered by now-hidden control state.

## Outcome

- Added an Electron application menu with `Settings...` under the macOS app menu and `CmdOrCtrl+,` shortcut support.
- Added a typed preload event subscription so the renderer can switch to Settings when the main process sends the menu event.
- Removed the left-column filter/control strip and its now-unused filtering state.
- Code review passed with blocker=0 and major=0.
- Verified typecheck, full tests, build, and whitespace checks.
