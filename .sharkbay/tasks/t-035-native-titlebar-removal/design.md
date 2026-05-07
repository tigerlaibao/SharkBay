# Design

## Approach

Use Electron's native macOS title bar hiding support on the existing main `BrowserWindow`:

- Add `titleBarStyle: "hiddenInset"` to the main window options.
- Keep `title: "SharkBay"` for window identity and accessibility metadata.
- Do not use `frame: false`, which would remove native window controls and require a custom drag/control implementation.

## Files

- `electron/main.ts`: main window creation only.

## Edge Cases

- On non-macOS platforms, Electron accepts the option but the visible behavior may differ; SharkBay's target platform is macOS.
- The app menu is independent of the title bar and should continue to be installed through `installApplicationMenu()`.

## Review

- blocker: 0
- major: 0
- Notes: The smallest sufficient change is a single BrowserWindow option; broader renderer chrome changes are out of scope.
