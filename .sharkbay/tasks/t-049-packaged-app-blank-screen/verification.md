# T-049 Verification

## Commands

- `npm run typecheck`
  - Exit code: 0
  - Evidence: renderer and node TypeScript projects passed with no errors.
- `npm test -- tests/build-config.test.ts`
  - Exit code: 0
  - Evidence: 1 test passed, confirming Vite uses `base: "./"`.
- `npm test -- tests/harness-reader.test.ts tests/build-config.test.ts`
  - Exit code: 0
  - Evidence: 17 tests passed, including runtime `templateRoot` detail-read regression.
- `npm run build`
  - Exit code: 0
  - Evidence: Vite built `dist/renderer/index.html`; generated script and stylesheet paths are `./assets/...`.
- `npm test`
  - Exit code: 0
  - Evidence: 13 test files passed, 75 tests passed.
- `npm run pack`
  - Exit code: 0
  - Evidence: electron-builder packaged `release/mac-arm64/SharkBay.app`.
- Packaged AIGF detail smoke:
  - Exit code: 0
  - Evidence: `readProjectDetail` with `release/mac-arm64/SharkBay.app/Contents/Resources/templates/harness` returned AIGF `harnessTemplate.status=current` and `templateErrors=[]`.
- `open -n release/mac-arm64/SharkBay.app`
  - Exit code: 0
  - Evidence: relaunched the rebuilt packaged app.
- `git diff --check`
  - Exit code: 0
  - Evidence: no whitespace errors.

## Result

Verification passed.
