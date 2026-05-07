# t-047-hide-xterm-custom-scrollbar Contract

## Scope

- Renderer CSS for terminal/xterm only.
- Hide xterm's custom scrollbar/shadow elements, not just native browser scrollbars.
- Preserve terminal scrollback and terminal interaction.

## Non-Goals

- Remove terminal scrollback.
- Change xterm session/process behavior.
- Hide scrollbars outside the terminal column.

## Done Criteria

- The translucent xterm custom scrollbar is no longer visible in the terminal column.
- Terminal output remains available and scrollback remains configured.
- Typecheck, build, and diff checks pass, or any skipped check is recorded.
