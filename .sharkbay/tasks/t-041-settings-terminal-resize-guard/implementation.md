# Implementation: t-041-settings-terminal-resize-guard

## Changes

- Added `validTerminalResizeDimensions` in `src/renderer/workflow.ts` and used it before renderer resize IPC calls.
- Updated `XTermSurface` to skip fit/resize work when xterm reports hidden or unmeasured dimensions such as `0`, `NaN`, or `Infinity`.
- Updated `TerminalManager.resize` to no-op invalid dimensions before calling `node-pty`, keeping the backend robust against malformed renderer payloads.
- Added regression coverage for renderer dimension validation and terminal manager invalid resize handling.

## Files Changed

- `src/renderer/App.tsx`
- `src/renderer/workflow.ts`
- `src/main/terminal.ts`
- `tests/renderer-workflow.test.ts`
- `tests/terminal.test.ts`
