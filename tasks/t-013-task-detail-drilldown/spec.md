# Spec

## Scope

- Remove the always-visible current task artifact preview from the default project right column.
- Keep the Tasks list visible in the default project right column.
- Make each task row selectable.
- When a task is selected, replace the whole right column with that task's detail content.
- Provide a back button that returns to the default project right column.

## Non-Goals

- Editing task files.
- Reordering or mutating task queue data.
- Changing runner or phase semantics.

## Acceptance Criteria

- Default project detail no longer shows the large current-task detail block above Tasks.
- Clicking any visible task row opens a full task detail page in the right column.
- The task detail page has a back button to return to the project overview.
- Task detail can use available task artifacts for backlog, active, done, and task-directory fallback rows.
