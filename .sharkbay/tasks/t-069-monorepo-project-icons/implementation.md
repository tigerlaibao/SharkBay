# t-069-monorepo-project-icons Implementation

## Changes

- Added common monorepo frontend package icon paths to `src/main/project-icons.ts`.
- Kept existing root-level semantic project icon paths ahead of package paths.
- Added scanner coverage for a managed monorepo project whose icon lives at `packages/web/public/icon-512.png`.

## Files Changed

- `src/main/project-icons.ts`
- `tests/scanner.test.ts`

## Notes

The implementation stays read-only and does not modify target projects. Real ItsMyLife scanning now returns `icon-512.png` as a local data URL before runtime favicon URL candidates.
