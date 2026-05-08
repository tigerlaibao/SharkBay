# t-051-day-night-theme-icons Implementation

## Changes

- Added `resources/shark-day.png`, `resources/shark-night.png`, `resources/shark-day.icns`, and `resources/shark-night.icns` from the user-provided day/night source icons.
- Added `appearanceTheme: "day" | "night"` to SharkBay app config with normalization for older config files.
- Added `config:setAppearanceTheme` IPC/preload support and Settings UI controls for explicit manual theme selection.
- Applied day/night app theme state through `data-theme` on the app shell.
- Added a night CSS palette for primary panels, Settings, controls, and terminal chrome.
- Made xterm.js terminal colors follow the selected theme for new and existing terminal tabs.
- Made Electron load the saved theme before window creation and set the matching Dock/window icon path at startup; Settings theme changes update the Dock icon immediately.
- Changed macOS packaging default icon to `resources/shark-day.icns`; `resources/shark-night.icns` is bundled for runtime use.

## Notes

- The icon assets preserve the supplied full macOS-style square composition. No circular mask, inset circle, or extra backing plate was added.
- Terminal color support exists through xterm.js `theme`; this task wires that support to the app appearance setting.
