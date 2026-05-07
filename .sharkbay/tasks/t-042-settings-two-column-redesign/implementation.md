# Implementation: t-042-settings-two-column-redesign

## Changes

- Reworked `SettingsView` into a two-column layout with left-side section navigation and right-side selected content.
- Added persistent Settings sections for `Project roots` and `Status`; both panels remain mounted and use `hidden` for switching so form state is preserved.
- Kept existing root add/remove/scan behavior inside `RootWorkflowPanel`.
- Added a Settings status panel for project attention, unavailable roots, scan issues, and summary counts.
- Added responsive CSS so the settings navigation collapses above the content on narrower widths.

## Files Changed

- `src/renderer/App.tsx`
- `src/styles/app.css`
