# t-046-hide-terminal-scrollbars Status

## Summary

- Task: Hide visible scrollbars in the middle terminal column.
- Status: done
- Phase: done
- Opened: 2026-05-07T19:55:51+08:00
- Source: User feedback that the middle terminal scrollbar should never be visible.

## Scope

- Hide terminal/xterm visible scrollbars through renderer CSS.
- Preserve terminal scrollback and existing keyboard/mouse scrolling behavior.
- Do not change terminal backend or PTY behavior.

## Progress

- [x] Registered task.
- [x] Implement terminal scrollbar CSS.
- [x] Run verification.
- [x] Record review and verification evidence.

## Result

Completed 2026-05-07T19:57:22+08:00. The middle terminal column hides xterm scrollbars while preserving scrollback.
