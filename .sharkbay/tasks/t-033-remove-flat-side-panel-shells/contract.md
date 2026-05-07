# Contract

## Scope

Remove the generic panel shell from the project and detail columns without changing data flow, task rendering, terminal behavior, or column resize state.

## Implementation Requirements

- Keep `project-panel` and `detail-panel` as structural layout classes.
- Remove only the generic `.panel` class from the left and right column section markup.
- Leave `terminal-panel` as a `.panel` because it still needs its framed terminal surface.
- Preserve existing `.detail-layout` scroll behavior and `.detail-tab-cards` sticky behavior.

## Verification

- Run `npm run typecheck`.
- Run `npm run build`.
- Run `git diff --check`.
- Review the diff for markup-only scope.
