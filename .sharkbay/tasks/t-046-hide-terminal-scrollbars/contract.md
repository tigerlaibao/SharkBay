# t-046-hide-terminal-scrollbars Contract

## Scope

- Renderer CSS for the terminal column only.
- Hide visible xterm scrollbars across Chromium/WebKit and Firefox scrollbar CSS paths.
- Preserve terminal scrollback configuration and terminal interaction.

## Non-Goals

- Remove terminal scrollback.
- Change terminal process/session behavior.
- Change right detail or left project column scrolling.

## Done Criteria

- The xterm viewport scrollbar is not visible in the middle terminal column.
- Terminal output remains scrollable through normal terminal input devices where supported.
- Typecheck, build, and diff checks pass, or any skipped check is recorded.
