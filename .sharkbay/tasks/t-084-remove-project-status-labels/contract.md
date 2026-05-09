# Implementation Contract

## Scope

- Remove the right Tasks tab project status strip.
- Remove renderer-only helpers and styles that only supported the removed status labels.
- Keep task phase rendering in task queues/details.
- Record an investigation of removable state/protocol candidates.

## Assumptions

- `task phases` must remain in task queue rows and task detail metadata.
- Harness template sync status is still needed by the explicit sync panel, not just the removed label.
- Runner and user-action metadata may still support Settings `Needs action` and prompt/handoff copy, so protocol removal needs a separate explicit task unless no remaining consumer exists.

## Non-Goals

- No deletion of persisted harness history.
- No removal of task phase fields.
- No removal of runner lifecycle or human-intervention protocol in this slice unless usage is proven absent.

## Done Criteria

- Right Tasks tab no longer shows the moved project status label row.
- Task queue phases still render.
- Dead renderer helpers/styles for the removed labels are deleted where safe.
- Investigation notes identify what can and cannot be removed next.
- Typecheck, build, and diff whitespace checks pass.
