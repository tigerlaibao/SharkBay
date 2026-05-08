# Contract

## Scope

- Soften right-column task priority badges in Night mode.
- Soften Info panel chips in Night mode.
- Restyle Managed/Not setup project count bubbles for Night mode.
- Reduce project avatar image scaling from the previous 118% to a more refined value.

## Non-Goals

- Do not change Morning or Day palette behavior.
- Do not alter project icon discovery or app icon resource generation.
- Do not redesign the project list layout.

## Verification

- Source checks confirm scoped selectors for `.queue-priority`, `.info-chip`, `.project-section-title span`, and adjusted avatar scale.
- `npm run typecheck`
- `npm test`
- `npm run build`
- `git diff --check`

