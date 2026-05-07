# Implementation

## Summary

Added a normalized `taskStatus` summary to project scan/detail data and changed project rows to display task queue state separately from runner execution and Needs Action state.

## Status Model

| Layer | Source | Values | Meaning |
| --- | --- | --- | --- |
| Task queue | visible queue plus safe task-directory fallback | `active`, `ready`, `backlog`, `done`, `idle`, `unknown` | What task work exists and whether a next task is available |
| Runner | `.sharkbay/runner.json` or legacy runner file | `running`, `stale`, `blocked`, `waiting_for_human`, `idle`, `unknown` | Whether an agent session is physically executing or stuck |
| Needs Action | derived renderer logic | reason string or null | Whether the user must intervene |

## Files Changed

- `src/main/harness-reader.ts`: derives `taskStatus` from active queue entries, actionable backlog, done queue entries, and state fallback.
- `src/shared/types.ts` and `src/renderer/types.ts`: add `ProjectTaskStatus` types.
- `src/renderer/workflow.ts`: exposes task status label/kind helpers and treats runner `waiting_for_human` as Needs Action even when no active task is present.
- `src/renderer/App.tsx`: renders task status, Needs Action, and runner status as separate project row pills.
- `src/styles/app.css`: adds task/runner pill styling.
- `tests/harness-reader.test.ts` and `tests/renderer-workflow.test.ts`: cover done projects with null/empty currentTask, ready backlog, task status label preference, and runner waiting state.

## Real Project Probe

After build, direct reader probe returned:

| Project | Task status | Runner |
| --- | --- | --- |
| AIBF | `done` | `unknown` |
| AIGF | `ready` for `t-008-conversion-measurement-and-admin` | `unknown` |
| ItsMyLife | `done` | `idle` |
| SharkBay | `active` / `coding` for `t-040-project-status-model` | `running` |

## Review

Self-review passed:

- No filesystem authority, template sync, terminal, or setup behavior changed.
- `activeTask` remains backward compatible; new UI status reads `taskStatus`.
- Incomplete `unknown` task-directory fallback rows do not override actionable backlog or done state.
- Red/blocked UI is reserved for true Needs Action or runner blocked/waiting states; ready backlog uses warning styling.
