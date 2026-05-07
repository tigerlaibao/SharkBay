# t-046-hide-terminal-scrollbars Implementation

## Change

- Changed terminal-specific xterm scrollbar styling from thin scrollbars to hidden scrollbars.
- Added WebKit scrollbar suppression for Electron/Chromium while keeping the xterm viewport and screen overflow behavior intact.

## Files

- `src/styles/app.css`
