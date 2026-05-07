# Spec

## Scope

Make a small UI copy/layout change in the workbench:

- Replace the middle column header text `Terminal` with the currently selected project name.
- Remove the right column's redundant top project name and project path header.

## Acceptance Criteria

- Selecting a managed project or not-setup project shows that project's name as the middle terminal column heading.
- When no project is selected, the terminal column still has a non-empty fallback heading.
- The right project detail view starts directly with its card tabs, not a project name/path header.
- The right not-setup detail view starts directly with setup content, not a project name/path header.
- No terminal session behavior, task detail page behavior, or project scanning behavior changes.

## Non-Goals

- Do not change terminal tab titles or runtime terminal title derivation.
- Do not change right detail tab contents.
- Do not change app layout widths or persistence.

## Open Questions

- None blocking.
