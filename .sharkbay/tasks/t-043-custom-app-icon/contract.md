# t-043-custom-app-icon Contract

## Scope

- Add a repository-owned icon asset derived from `~/Downloads/shark.png`.
- Configure Electron to use the asset for the main window icon.
- Configure macOS Dock icon during runtime where supported.

## Non-Goals

- Add a full app packaging pipeline.
- Publish, release, notarize, or deploy the macOS app.
- Change product UI styling beyond the app icon configuration.

## Done Criteria

- The icon asset is present in the repository under a stable resources/assets path.
- Electron resolves the icon path in both development and packaged runtime path shapes.
- `BrowserWindow` receives the icon option.
- macOS runtime uses `app.dock.setIcon` when available.
- Typecheck, build, and diff whitespace checks pass.

