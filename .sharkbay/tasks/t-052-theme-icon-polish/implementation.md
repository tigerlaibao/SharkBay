# t-052-theme-icon-polish Implementation

## Changes

- Regenerated `resources/shark-day.png` and `resources/shark-night.png` from the original Downloads assets with a full-bleed macOS-style rounded rectangle alpha mask.
- Regenerated `resources/shark-day.icns` and `resources/shark-night.icns` from the rounded PNG resources.
- Changed day-mode terminal chrome from dark to warm cream/tan to match the light app palette.
- Changed day-mode xterm palette from plain white/blue to a warmer cream terminal background with teal cursor and muted ANSI colors.
- Restored night-mode xterm palette to the original dark terminal feel: `#101719` background, `#d9e5df` foreground, `#93d7a4` cursor, and `#38575d` selection.
- Reworked night-mode shell/panel colors away from the blue palette toward dark teal/charcoal.
- Added night-mode coverage for missed surfaces including project rows, project icons, right detail tab cards, artifact tab buttons, terminal empty state, and active/hover states.
- Updated Electron BrowserWindow night background color to match the dark teal app shell.

## Notes

- The icon artwork remains full-bleed within the rounded app shape; no circular inner mask or inset backing plate was added.
