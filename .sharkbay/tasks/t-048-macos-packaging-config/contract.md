# t-048-macos-packaging-config Contract

## Scope

- `package.json` packaging scripts/config.
- `package-lock.json` dependency classification resulting from the user's install.
- `.gitignore` release output exclusion.
- `README.md` packaging instructions.
- Harness task records.

## Non-Goals

- Notarization, signing certificates, release publishing, or deployment.
- Changing app runtime behavior.
- Replacing Electron or build tooling.

## Done Criteria

- `electron-builder` is a dev dependency.
- `npm run pack` creates an unpacked macOS app.
- `npm run dist` is available for a distributable macOS build.
- Packaging uses the SharkBay app icon.
- Typecheck/build and packaging verification pass, or failures are recorded with reason.
