# Contract

## Scope

Update the workbench renderer styling and minimal markup structure needed to satisfy the visual polish request.

## Implementation Requirements

- Reuse existing class names and layout patterns where possible.
- Keep the right detail tab strip mounted and outside the scrollable content area.
- Avoid changing task ordering, queue data, or terminal behavior.
- Preserve existing `t-031` task detail metadata changes.

## Verification

- Run `npm run typecheck`.
- Run `npm run build`.
- Run `git diff --check`.
- Review the changed CSS/TSX diff for unintended scope.
