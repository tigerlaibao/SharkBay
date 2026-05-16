# Release And Packaging

SharkBay packages with Electron Builder for macOS.

## Commands

Build TypeScript and renderer assets:

```bash
npm run build
```

Create an unpacked app for local smoke testing:

```bash
npm run pack
```

Create distributable macOS artifacts:

```bash
npm run dist
```

## Outputs

Electron Builder writes outputs to `release/`. The macOS config targets DMG and zip artifacts, and unpacked packs include a local app bundle under `release/mac-*`.

## Package Inputs

The Electron Builder config in `package.json` includes:

- `dist/renderer/**/*`
- `dist-electron/**/*`
- `package.json`
- `resources/` as extra resources

The package entry is `dist-electron/electron/main.js`.

## Native Modules

`node-pty` is a native module and is unpacked from ASAR. The install and rebuild scripts run `electron-rebuild` and fix native helper permissions.

Run this after Electron, Node, or native dependency changes:

```bash
npm run rebuild:native
```

## Resources

Runtime icons are read from `resources/` in development and from `process.resourcesPath/resources` in packaged builds. Current app themes use day, night, and morning icon variants.

## Release Checks

Before producing distributable artifacts:

1. `npm run typecheck`
2. `npm test`
3. `npm run build`
4. `npm run pack`
5. Smoke test the unpacked app with a temporary project folder
6. `npm run dist`

Local builds use ad-hoc signing unless signing and notarization credentials are configured.

## Known Packaging Note

`tsconfig.node.json` currently includes `tests/**/*.ts`, and Electron Builder includes all of `dist-electron/**/*`. Review packaged contents before a public release if compiled tests should be excluded.
