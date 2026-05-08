# t-050-project-icons Contract

## Scope

- Add project icon metadata to normalized scan results for managed and not-setup project rows.
- Render a stable circular project icon in the left project list.
- Bundle `~/Downloads/shark-fin.png` as the default icon.
- Prefer local app icons from common repository icon locations when available.
- Otherwise derive favicon candidates from project-authored URLs.
- Fall back to the bundled default image when an icon cannot be resolved or fails to load.

## Non-Goals

- No persistent favicon cache.
- No background network download service.
- No writes to managed projects.
- No user-facing icon picker.

## Design

Runtime icon resolution uses ordered candidates:

1. Local image file candidates under the project directory, such as `resources/shark.png`, `resources/icon.png`, `public/favicon.*`, `app/icon.*`, and Electron build icon paths from `package.json`.
2. Web favicon URLs derived from `project.localUrl`, `project.testUrl`, or `project.deploymentUrl`, using `/favicon.ico` and Google favicon service candidates.
3. Bundled default `shark-fin.png`.

The main process only returns string metadata. For local files, it returns data URLs so the renderer never receives raw filesystem authority for arbitrary project icon paths. For web favicons, the renderer receives normal HTTPS/HTTP image URLs and relies on the browser image loader. The renderer handles `onError` by switching to the default icon.

## Done Criteria

- Project rows display fixed-size circular icons without layout shifting.
- Managed project icon metadata includes local icon data URLs when common app icon files exist.
- Projects with authored URLs receive favicon candidates.
- Not-setup project rows receive the default icon.
- Missing/broken icon candidates fall back to the bundled shark fin.
- Verification records `npm run typecheck`, focused tests, `npm run build`, `npm test`, and `git diff --check` results.
