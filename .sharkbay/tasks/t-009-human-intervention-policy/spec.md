# Spec

## User Goal

The left sidebar should answer one question: "Where do I need to intervene?"

If all tasks are done, the project should not appear in `Needs Action`. If a model can continue safely by itself, the project should not appear there either. The project should appear only when user input, approval, review, verification, or unblocking is required.

## Problem

The current sidebar treats dirty worktree state as user action. That is noisy and misleading: a dirty worktree often means work is in progress, not that the user needs to do anything.

The current phase vocabulary also lacks a visible product policy separating:

- automatic phases where the agent should keep working
- human-gated phases where the user must decide or validate
- blocked states where the user may need to provide missing information or approval

## Requirements

| Priority | Requirement | Acceptance Criteria |
| --- | --- | --- |
| P0 | Quiet all-done state | A project with no active task and all tasks done is absent from `Needs Action`. |
| P0 | Human gate detection | `blocked`, explicit blocked gates, explicit approval requirements, and explicit user-action flags show in `Needs Action`. |
| P0 | Auto phase silence | `spec`, `design`, `design_review`, `contract`, `coding`, `code_review`, `code_revision`, `verification`, `docs_update`, and `done` do not show as user action by themselves. |
| P0 | Dirty is not action | Dirty worktree alone does not put a project in `Needs Action`. |
| P1 | Reasonable label | Sidebar item shows the action phase/reason, not an unrelated internal status. |
| P1 | Protocol clarity | Harness protocol documents when to continue automatically and when to stop for humans. |

## Non-Goals

- Automatic task execution from the SharkBay UI.
- Notifications outside the app.
- New queue states or a schema migration.

## Acceptance Test Examples

| Project State | Needs Action? | Reason |
| --- | --- | --- |
| all tasks done, clean | no | no decision pending |
| all tasks done, dirty | no | dirty is implementation state, not user action |
| active task `coding` | no | agent should continue |
| active task `blocked` | yes | user or controller must unblock |
| active task `design_review` | no | reviewer/controller can continue unless an approval stop is recorded |
| active task `verification` | no | verifier/controller can continue unless a verification exception needs approval |
| active task gate `blocked` | yes | explicit gate block |
| active task has explicit user-action flag | yes | recorded human intervention |
