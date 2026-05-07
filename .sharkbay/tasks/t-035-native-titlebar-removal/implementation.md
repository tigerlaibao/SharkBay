# Implementation

## Summary

Configured the main Electron window to use hidden native macOS title bar behavior:

- `electron/main.ts` now sets `titleBarStyle` to `"hiddenInset"` on macOS.
- Non-macOS keeps Electron's `"default"` title bar behavior.
- Existing native traffic-light controls, app title metadata, menu installation, preload, and load behavior remain unchanged.

## Files Changed

| Path | Change |
| --- | --- |
| `electron/main.ts` | Added platform-specific `titleBarStyle` to the main `BrowserWindow` options. |

## Scope Notes

No renderer layout or custom window-control code was added. A frameless custom window would be broader and would require custom drag/control behavior.
