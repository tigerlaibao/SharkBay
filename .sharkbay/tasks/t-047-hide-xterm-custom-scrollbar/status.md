# t-047-hide-xterm-custom-scrollbar Status

## Summary

- Task: Hide xterm's custom terminal scrollbar.
- Status: done
- Phase: done
- Opened: 2026-05-07T20:03:32+08:00
- Source: User feedback that a translucent scrollbar is still visible in the middle terminal after `t-046`.

## Scope

- Hide xterm's custom `.xterm-scrollable-element > .scrollbar` UI in the terminal column.
- Preserve terminal scrollback and normal terminal scrolling.
- Keep right detail and left project scrolling unchanged.

## Progress

- [x] Registered task.
- [x] Implement CSS fix for xterm custom scrollbar.
- [x] Run verification.
- [x] Record review and verification evidence.

## Result

Completed 2026-05-07T20:05:07+08:00. Xterm's custom translucent scrollbar and shadow UI are hidden in the terminal column while terminal scrollback remains enabled.
