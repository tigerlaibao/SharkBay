# t-048-macos-packaging-config Implementation

## Change

- Moved `electron-builder` into `devDependencies` via `npm install --save-dev electron-builder`.
- Added `pack` and `dist` package scripts.
- Added `electron-builder` configuration for:
  - app identity and product name
  - release output directory
  - bundled renderer/main build outputs
  - bundled `resources` and `templates/harness` runtime resources
  - `node-pty` native module unpacking
  - macOS icon, category, dmg, and zip targets
- Added `release/` to `.gitignore` so generated packaging output stays out of git.
- Added README packaging commands and output notes.

## Files

- `package.json`
- `package-lock.json`
- `.gitignore`
- `README.md`
