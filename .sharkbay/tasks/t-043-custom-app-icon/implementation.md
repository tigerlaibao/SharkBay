# t-043-custom-app-icon Implementation

## Changes

- Copied the provided `~/Downloads/shark.png` into `resources/shark.png`.
- Generated `resources/shark.icns` from the PNG as a macOS app-icon asset for future packaging.
- Added resource path helpers in `electron/main.ts`.
- Passed the icon path to `BrowserWindow`.
- Added macOS Dock icon setup with `nativeImage.createFromPath(...)` and `app.dock.setIcon(...)`.

## Notes

- The current repository does not yet have an Electron packaging pipeline, so the runtime wiring is complete and `resources/shark.icns` is ready for a later packaging task.

