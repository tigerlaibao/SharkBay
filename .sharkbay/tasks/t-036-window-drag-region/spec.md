# Spec

## User Goal

After task t-035 removed the visible native macOS title bar, SharkBay needs a replacement region for moving the window and using normal titlebar-like double-click behavior. The left project column also needs to start lower so the project rows do not overlap the traffic-light controls.

## Assumptions

- The app should keep `titleBarStyle: hiddenInset` from t-035.
- A transparent renderer drag strip is acceptable because the user explicitly approved it.
- Interactive UI under the drag strip must remain clickable by staying outside the strip or using `app-region: no-drag`.

## Non-Goals

- No custom red/yellow/green controls.
- No broad workbench redesign.
- No release/package changes.

## Verification

- `npm run typecheck`
- `npm run build`
- `git diff --check`
- Manual/visual check when available: left project content sits below traffic lights and a top strip exists for window dragging.
