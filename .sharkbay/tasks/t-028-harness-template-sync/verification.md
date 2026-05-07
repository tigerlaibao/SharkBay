# Verification

## Checks

### Typecheck

```text
$ npm run typecheck
Exit code: 0
> sharkbay@0.1.0 typecheck
> tsc -p tsconfig.renderer.json --noEmit && tsc -p tsconfig.node.json --noEmit
```

### Focused Tests

```text
$ npm test -- tests/harness-template-sync.test.ts tests/template-installer.test.ts
Exit code: 0
Test Files  2 passed (2)
Tests  12 passed (12)
```

Covered:

- Fresh installs are current and include sync metadata.
- Stale `AGENTS.md` is detected.
- Update preserves `.agent/state.json`, `.gitignore`, and `docs/product.md`.
- Old installs without metadata are current when file content matches.
- Scan summaries include stale file status.
- Unsafe configured roots and symlinked version-owned files are rejected.

### Full Test Suite

```text
$ npm test
Exit code: 0
Test Files  11 passed (11)
Tests  59 passed (59)
```

### Build

```text
$ npm run build
Exit code: 0
vite built successfully in 556ms.
Warning: renderer chunk is larger than 500 kB after minification.
```

### Diff Hygiene

```text
$ git diff --check
Exit code: 0
```

## Done Criteria Mapping

| Criterion | Evidence |
| --- | --- |
| Current template version computed from version-owned tracked files | `tests/harness-template-sync.test.ts` current install and no-metadata cases |
| New installs write sync metadata | `tests/template-installer.test.ts` asserts `.agent/template-sync.json` |
| Stale installed control files detected | Focused stale `AGENTS.md` test |
| Update writes only version-owned files | Focused preservation assertions for `.agent/state.json` and `docs/product.md` |
| Safety rejects outside roots and symlinks | Focused unsafe root and symlink test |
| Existing checks still pass | Typecheck, full tests, build, and diff check above |

## Result

Verification passed.
