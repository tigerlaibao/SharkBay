# t-053-classic-theme-and-night-panels Contract

## Scope

- Add `classic` as a persisted appearance theme option.
- Show Classic in Settings beside Day and Night.
- Make Classic use the light app shell with the original dark terminal container and terminal palette.
- Keep Day and Night behavior from T052.
- Add night-mode CSS coverage for Decisions and Git list items and related panel surfaces.

## Non-Goals

- No automatic theme switching.
- No per-project or per-terminal theme customization.
- No icon changes.

## Done Criteria

- `appearanceTheme` accepts and persists `classic`.
- Settings exposes Day, Night, and Classic.
- Classic visually restores light left/right areas plus dark middle terminal.
- Night mode Decisions and Git panels/list items use dark theme colors.
- Required verification passes.
