# t-016-resizable-workbench-columns

## Status

- Phase: done
- Gate: passed
- Owner: Codex
- Started: 2026-05-06
- Completed: 2026-05-06

## Goal

Make the workbench's three main columns resizable with draggable dividers between project list, task detail, and terminal.

## Acceptance Criteria

- The divider between project list and task detail can be dragged.
- The divider between task detail and terminal can be dragged.
- Width changes preserve usable minimum widths for all three columns.
- Terminal fills the right column and refits after column resize.
- Column widths persist across reloads.

## Notes

- This is a follow-up to `t-015-xterm-node-pty-terminal-spaces`.
- Implemented with two persisted column widths: project list and task detail. The terminal column fills the remaining width.
- Verification passed with typecheck, tests, build, and diff whitespace checks.
