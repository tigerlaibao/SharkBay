# Design

## Policy

Use a small deterministic policy in renderer workflow code:

- Human intervention phases: `blocked`, `approval_required`, `waiting_for_user`, and other explicit user-gated states.
- Auto-continuable phases: `intake`, `spec`, `design`, `design_review`, `design_revision`, `contract`, `coding`, `code_review`, `code_revision`, `verification`, `docs_update`, `done`.
- Explicit `gateStatus: blocked` always needs action.
- Explicit approval/user-action metadata always needs action.
- Explicit `gateStatus: pending` is not automatically user action; pending usually means the agent/controller should continue through the next phase.
- Dirty worktree is not a user-action signal.

## UI

The left sidebar stays sparse:

- Hide the entire `Needs Action` section when no project needs action.
- For listed projects, show the project name and the intervention phase/reason.
- Do not list clean/done projects.
- Do not list projects only because their worktree is dirty.

The right detail task list remains the canonical place for all tasks, whether active, queued, or done.

## Files

| File | Change |
| --- | --- |
| `src/renderer/workflow.ts` | Add exported `projectNeedsUserAction` and `userActionReason` helpers. |
| `src/renderer/App.tsx` | Use helpers for sidebar filtering and label. |
| `tests/renderer-workflow.test.ts` | Cover action/no-action policy. |
| `.agent/protocol.md` | Add human intervention discipline. |

## Risk

The main risk is hiding a project that actually needs user input. The first policy treats automatic Codex phases as quiet, but provides explicit flags and blocked gates for real human intervention.
