# t-050-project-icons Code Review

## Findings

- blocker: 0
- major: 0
- minor: 0

## Review Notes

- Scope matches the contract: icon metadata is read-only scan/detail data and renderer fallback is local.
- Filesystem safety is preserved: local icon reads use `resolveReadableRepoFile`, reject unsafe relative paths, reject symlink escapes through existing path-safety behavior, and cap icon reads at 1 MiB.
- Network behavior is display-only: favicon candidates are normal image URLs; no background fetcher, cache, or managed project write was added.
- UI layout is stable: project rows now reserve a fixed 32px icon column.

## Checks Reviewed

- `npm run typecheck`
- `npm test -- tests/scanner.test.ts`
- `npm run build`
- `npm test`
- `git diff --check`
