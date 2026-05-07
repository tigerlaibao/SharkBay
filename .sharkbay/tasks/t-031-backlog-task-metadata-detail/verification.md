# Verification

## Checks

```text
$ npm test -- tests/harness-reader.test.ts
Exit code: 0
Test Files  1 passed (1)
Tests  12 passed (12)
```

```text
$ npm run typecheck
Exit code: 0
```

```text
$ npm test
Exit code: 0
Test Files  11 passed (11)
Tests  59 passed (59)
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

## AIGF Probe

```text
$ node -e "import('./dist-electron/src/main/harness-reader.js').then(async ({ readProjectDetail }) => { ... })"
Exit code: 0
```

Output excerpt:

```json
{
  "task": {
    "taskId": "t-008-conversion-measurement-and-admin",
    "title": "Conversion measurement and admin",
    "priority": 3,
    "dependsOn": ["t-004-interaction-api"],
    "notes": "Add safe admin/reporting views and conversion event storage after production backend approval.",
    "phase": "backlog",
    "status": "backlog"
  },
  "artifactValues": [null, null, null, null, null, null, null, null, null],
  "matchingErrors": []
}
```

## Result

Verification passed.
