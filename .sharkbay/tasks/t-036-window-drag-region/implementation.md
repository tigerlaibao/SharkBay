# Implementation

## Summary

Restored a renderer-owned draggable window affordance while keeping the hidden native macOS title bar from `t-035`:

- `src/renderer/App.tsx` now renders a transparent top-level `window-drag-strip` inside the app shell.
- `src/styles/app.css` marks that strip with Electron-compatible `-webkit-app-region: drag` and `app-region: drag`.
- The workspace top padding increased so dashboard and Settings content start below the strip and the native traffic-light controls.

## Files Changed

| Path | Change |
| --- | --- |
| `src/renderer/App.tsx` | Added the top-level transparent drag strip. |
| `src/styles/app.css` | Added drag-region styling and increased workspace top inset. |

## Scope Notes

No Electron main-process behavior changed. Interactive controls remain below the 30px drag strip; the strip begins after the native traffic-light control area and ends before the right window edge.
