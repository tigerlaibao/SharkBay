# Verification

## Checks

```text
$ npm test -- tests/template-installer.test.ts
Exit code: 0
Test Files  1 passed (1)
Tests  8 passed (8)
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

```text
$ git diff --check
Exit code: 0
```

```text
$ npm test
Exit code: 0
Test Files  11 passed (11)
Tests  60 passed (60)
```

## Done Criteria Mapping

- Existing-directory Ripple setup skips the template `.gitignore` when the target already has one: covered by `preserves existing project gitignore during existing directory setup`.
- New project setup still seeds the template `.gitignore`: covered by existing `creates a harness repo from bundled templates`.
- Real collisions still fail without partial writes: covered by existing template collision and `AGENTS.md` collision tests.
- Regression tests cover the existing `.gitignore` case: added focused test in `tests/template-installer.test.ts`.

## Result

Verification passed.
