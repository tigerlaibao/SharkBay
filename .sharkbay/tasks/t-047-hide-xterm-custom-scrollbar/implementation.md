# t-047-hide-xterm-custom-scrollbar Implementation

## Change

- Added terminal-scoped CSS rules for xterm's custom scrollbar DOM:
  - `.xterm-scrollable-element > .scrollbar`
  - `.xterm-scrollable-element > .shadow`
- The rules hide the custom translucent scrollbar/shadow without changing terminal scrollback or PTY behavior.

## Files

- `src/styles/app.css`
