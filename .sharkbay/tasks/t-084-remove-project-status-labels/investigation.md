# Investigation

## Removed In This Slice

- `ProjectStatusStrip` in the right Tasks tab.
- Renderer-only helpers used only by the removed status labels:
  - project phase/status class helpers for project-level pills
  - runner label/class helpers for project-level pills
  - `StatusPill`
- CSS for removed project-level status labels:
  - `status-pill`
  - `runner-pill`
  - `harness-pill`
  - removed `task-*`, `runner-*`, and `status-*` label variants that no longer have markup consumers
- `ProjectTaskStatus` / `taskStatus` derived scan summary.
  - This was an app-derived state machine from `active/ready/backlog/done/idle/unknown`.
  - It existed to summarize project status for project-row/status labels.
  - Task phases remain available directly on queue items and active task summaries.

## Kept

- Task phases:
  - Still rendered in task queue rows.
  - Still stored in task artifacts/queue/currentTask and used for task detail.
- Runner lifecycle metadata:
  - Still powers Settings `Needs action` and prompt/handoff decisions.
- User action metadata:
  - `requiresUserAction` and `userActionReason` still power Settings `Needs action` and PromptPanel reason copy.
- Gate status parsing:
  - Still contributes to `userActionReason` when a task or project is explicitly blocked.
- Harness template sync summary:
  - Still powers the explicit sync panel and should not be removed as part of label cleanup.

## Future Removal Candidates

- If Settings `Needs action` and PromptPanel handoff/reason copy are removed or redesigned, then the runner/user-action/gate workflow helpers and corresponding protocol metadata could be reduced.
- If the harness stops supporting explicit blocked gates, then `gateStatus` could be removed from `ActiveTaskSummary` and queue item parsing. That is a protocol change and should be a separate task because it affects old project data and tests.

## Not A Removal Candidate

- `phase` is not a candidate. The app still needs task phases for task rows, task detail metadata, and agent workflow state.
