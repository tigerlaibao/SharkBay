# t-051-day-night-theme-icons Contract

## Scope

- Add repository resources for day and night app icons derived from the user-provided files.
- Persist a day/night theme preference in SharkBay app config.
- Add a Settings control for manual theme selection.
- Apply matching day/night CSS palettes to the app shell.
- Make new and existing xterm.js terminal tabs use the selected terminal palette.
- Wire macOS Dock and BrowserWindow icon selection to the saved preference.

## Non-Goals

- No automatic time-of-day or macOS system appearance switching.
- No per-project or per-terminal custom themes.
- No broad layout redesign.

## Done Criteria

- Settings includes an explicit day/night theme selector.
- The selected theme persists through the existing config IPC path.
- The app surface and terminal colors change when the selector changes.
- Electron chooses the matching day/night PNG for Dock and window icons at startup.
- Required verification commands pass or any skipped check is recorded with a reason.
