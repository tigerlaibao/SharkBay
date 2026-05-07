# Contract

## Done Criteria

- A top transparent drag region is present in the dashboard/settings shell and uses Electron-compatible `app-region: drag`.
- App controls and resizers remain excluded from drag behavior via layout or explicit `app-region: no-drag`.
- The left project panel content has a top inset large enough to avoid macOS traffic-light controls under `hiddenInset`.
- No Electron main-process behavior is broadened beyond the existing hidden titlebar configuration.
- Required checks pass or any skipped check is recorded with reason.

## Files Expected To Change

- `src/renderer/App.tsx`
- `src/styles/app.css`
- Harness task/status/docs files for traceability.
