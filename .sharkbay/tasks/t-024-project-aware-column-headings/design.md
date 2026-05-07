# Design

## UI Behavior

- `TerminalPane` already receives the selected `ProjectCandidate`; use `candidate.name` as the header label, falling back to the active terminal space name or `Terminal` when no project is selected.
- Remove the `detail-header` block from `NotSetupPane`.
- Remove the `detail-header` block from `ProjectDetailPane`.
- Keep `TaskDetailPage`'s header because it provides the task title and back navigation rather than the top-level project name/path pair.

## Files Likely To Change

- `src/renderer/App.tsx`

## Risks

- Removing the detail header could leave excessive vertical spacing or missing navigation if applied to task detail pages. Limit removal to top-level project/not-setup detail views.

## Verification

- Typecheck catches JSX/TypeScript regressions.
- Focused source review confirms exact title/header behavior.
