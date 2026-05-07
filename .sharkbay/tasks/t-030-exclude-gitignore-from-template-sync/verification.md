# Verification

## Checks

```text
$ npm test -- tests/harness-template-sync.test.ts tests/template-installer.test.ts
Exit code: 0
Test Files  2 passed (2)
Tests  12 passed (12)
```

```text
$ npm run typecheck
Exit code: 0
```

```text
$ npm run build
Exit code: 0
Vite build passed with the existing chunk-size warning.
```

## Consistency Check

- `versionOwnedHarnessTemplateFiles` contains only `AGENTS.md`, `.agent/protocol.md`, and `.agent/quality-rules.md`.
- SharkBay root `.gitignore` is restored in commit `78bfd29 Restore product gitignore rules`.
- Template `.gitignore` remains setup seed content: `.agent/runner.json`.
- Current managed project scan reports AIBF, AIGF, and SharkBay as `current`.

## Result

No product-code conflict remains between the sync allowlist change and the `.gitignore` restore task.
