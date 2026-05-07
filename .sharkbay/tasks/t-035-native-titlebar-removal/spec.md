# Spec

## User Goal

The user wants SharkBay's Electron window to stop showing the white standard macOS title bar because it wastes a row of vertical space.

## Requirements

- Hide the native title bar for the main app window on macOS.
- Preserve the standard macOS traffic-light controls.
- Preserve existing application menu behavior, including Settings.
- Preserve current window dimensions, minimum size, preload, and load paths.

## Assumptions

- The intended behavior is the common Electron `titleBarStyle: "hiddenInset"` treatment on macOS, not a fully frameless window with custom window controls.
- A separate custom drag region is not required for this slice because the request is specifically about removing the visible standard title bar.

## Non-Goals

- Redesigning the app's top chrome.
- Adding custom window control buttons.
- Changing renderer layout, terminal behavior, or project state behavior.

## Risks

- A fully frameless window would require custom drag regions and could degrade native macOS affordances; avoid it.
- Traffic-light controls could overlap app UI if moved manually; use Electron's built-in hidden-inset placement.

## Verification Approach

- Run TypeScript checks to validate `BrowserWindow` option types.
- Run production build to validate Electron and renderer compilation.
- Run `git diff --check` to catch whitespace or patch issues.
