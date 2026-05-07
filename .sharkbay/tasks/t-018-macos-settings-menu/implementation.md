# Implementation

## Summary

- Added a reusable Electron application menu template and installed it from the main process.
- Added a shared `app:openSettings` channel and preload `app.onOpenSettings` subscription API.
- Wired the renderer root to switch to the existing Settings view when the menu event is received.
- Removed the left project panel's search/filter/refresh/settings controls and the associated filtering state.

## Files Changed

- `electron/main.ts`
- `electron/preload.mts`
- `src/main/application-menu.ts`
- `src/shared/app-events.ts`
- `src/renderer/App.tsx`
- `src/renderer/types.ts`
- `src/styles/app.css`
- `tests/application-menu.test.ts`

## Known Risks

- Manual macOS menu clicking was not exercised in a live Electron window during this pass; the menu template and renderer wiring were covered by typecheck/build and unit tests.
