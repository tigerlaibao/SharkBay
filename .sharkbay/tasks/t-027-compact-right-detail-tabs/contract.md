# Contract

## Done Criteria

1. Right detail tabs use a compact tab-strip visual treatment instead of card-like boxes.
   - Verification: CSS diff inspection and browser visual check.

2. The active tab remains visually distinct without a heavy filled block.
   - Verification: CSS diff inspection and browser visual check.

3. Existing tab behavior and accessibility attributes remain unchanged.
   - Verification: no `src/renderer/App.tsx` behavior changes are required; run `npm run typecheck`.

4. The implementation does not alter unrelated public harness cleanup changes.
   - Verification: inspect `git diff --stat` and changed files.

## Files In Scope

- `src/styles/app.css`
- Local ignored task artifact `tasks/t-027-compact-right-detail-tabs/**`

## Files Out Of Scope

- `src/renderer/App.tsx` behavior
- `src/main/**`
- `electron/**`
- `.gitignore`
- Public harness cleanup changes already in progress

## Required Checks

- `npm run typecheck`
- `npm run build`
- `git diff --check`
- Browser visual check of right detail tabs

## Stop Conditions

- Stop if the compact tab style requires changing tab behavior.
- Stop if verification is blocked by the existing public cleanup work in a way that would require reverting or staging unrelated files.
