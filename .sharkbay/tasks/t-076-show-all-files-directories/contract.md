# Contract

## Scope

Update the Files tab backend listing so it no longer hides directories/files by name.

## Requirements

- Remove the generated/heavy directory name skip list.
- Include hidden files and hidden directories in the tree.
- Include `.env` and `.env.*` files as editable entries.
- Include `.git`, `node_modules`, `dist`, `release`, and similar directories when they exist.
- Keep configured-root containment checks.

## Safety Boundary

- Do not read file contents.
- Do not expose paths outside the selected project/configured root.
- Symlink escapes must still not be recursively followed outside the configured project boundary.

## Verification

- Update focused project file tests.
- Run `npm test -- tests/project-files.test.ts`.
- Run `npm run typecheck`.
- Run `npm run build`.
- Run `git diff --check`.
