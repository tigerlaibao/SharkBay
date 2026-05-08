# t-053-classic-theme-and-night-panels Implementation

## Changes

- Added `classic` to the shared and renderer `AppearanceTheme` union.
- Updated app config normalization and theme setter handling so `classic` persists through `appearanceTheme`.
- Added Classic to the Settings appearance segmented control.
- Added Classic terminal xterm palette using the original dark terminal colors.
- Added Classic CSS overrides so the app keeps the light workspace while the terminal panel, terminal tabs, terminal empty state, and xterm surface use the original dark styling.
- Added night-mode coverage for Decisions/Git `.decision-item`, `.history-time`, and `.artifact-panel` surfaces.
- Updated the Night swatch to use dark teal instead of the earlier blue palette.

## Notes

- Classic intentionally uses the existing day icon because it is a layout/color mode, not a third icon mode.
