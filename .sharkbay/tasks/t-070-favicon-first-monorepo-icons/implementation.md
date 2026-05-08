# t-070-favicon-first-monorepo-icons Implementation

## Changes

- Reordered monorepo web package icon candidates in `src/main/project-icons.ts` so `favicon.ico` and `favicon.png` are preferred before `apple-touch-icon.png`, `icon-512.png`, and `logo.png`.
- Preserved explicit `project-icon.png` priority for root and monorepo package paths.
- Updated scanner coverage to prove a package favicon wins over `icon-512.png`.

## Files Changed

- `src/main/project-icons.ts`
- `tests/scanner.test.ts`
