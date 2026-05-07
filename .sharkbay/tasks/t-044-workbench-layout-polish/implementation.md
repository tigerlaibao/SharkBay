# t-044-workbench-layout-polish Implementation

## Changes

- Moved the hidden-titlebar drag strip out of the global app shell and into the left project column.
- Removed global workspace top padding so the terminal and right detail columns use the top of the window.
- Kept the left project column offset below the macOS traffic-light area with local top padding.
- Preserved Settings top offset separately so Settings content does not start under the hidden titlebar controls.
- Increased right detail tab strip/card height from about 32px to 48px.
- Added extra bottom room to active xterm surfaces so the last terminal row is not clipped.

## Files

- `src/renderer/App.tsx`
- `src/styles/app.css`

