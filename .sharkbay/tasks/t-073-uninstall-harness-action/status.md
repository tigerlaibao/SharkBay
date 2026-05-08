# T-073: Add uninstall harness action

- Status: done
- Phase: done
- Depends on: none
- Started: 2026-05-08T20:29:48+08:00
- User goal: Add an uninstall harness feature activated from a right-click menu on left project cards. After user confirmation, remove harness files from the project workspace and remove only the corresponding `.gitignore` lines.

## Current State

- Implementation, review, and verification are complete.
- No dependency blockers.

## Phase Log

- 2026-05-08T20:29:48+08:00: Opened contract for a confirmation-gated harness uninstall UI and backend action.
- 2026-05-08T20:29:48+08:00: Contract passed with safety constraints; advanced to coding.
- 2026-05-08T20:42:13+08:00: Implemented the uninstall backend, IPC bridge, Managed-row context menu, confirmation flow, and focused tests.
- 2026-05-08T20:42:13+08:00: Code review passed with no blocker, major, or minor findings.
- 2026-05-08T20:42:13+08:00: Verification passed; task marked done.
