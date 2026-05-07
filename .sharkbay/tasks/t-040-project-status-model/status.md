# Task Status

## Summary

| Field | Value |
| --- | --- |
| Task ID | `t-040-project-status-model` |
| Title | Clarify project task, runner, and waiting states |
| Phase | done |
| Status | done |
| Priority | 1 |
| Depends on | none |

## Goal

Make SharkBay's project list and detail surfaces clearly distinguish:

- task queue state: active phase, ready backlog, backlog waiting on dependencies, done, idle, or unknown;
- runner execution state: running, stale, blocked, waiting for human, idle, or unknown;
- user waiting state: only explicit human-intervention signals, runner problems, or blocked gates.

## Problem

The current UI uses `activeTask.phase` as the project row status. That collapses different meanings:

- a real Active queue task;
- a stale `state.currentTask` pointing at a completed task;
- a project with no active task but completed task history;
- runner lifecycle and human waiting states.

This is why AIBF/AIGF show `done` while ItsMyLife/SharkBay show no status even though all four are managed projects with completed work.

## Contract

- Add a normalized project task status summary derived from visible queue sections and state fallback.
- Keep runner lifecycle separate from task phase and continue showing Needs Action only for real human intervention or broken runner registration.
- Update project rows to show task status consistently for managed projects, and show runner/waiting status as separate pills.
- Add focused tests for completed-with-empty-currentTask, completed-with-null-currentTask, ready backlog, active running, and waiting-for-human cases.
- Do not change unrelated harness migration, terminal, setup, or filesystem authority behavior.

## Verification Plan

- `npm test -- tests/harness-reader.test.ts tests/renderer-workflow.test.ts`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `git diff --check`

## Notes

- Existing unrelated working-tree changes are present before this task: root `AGENTS.md`, deleted root docs files, and untracked local `.sharkbay/`. They are preserved and not part of this task.

## Phase History

| Time | Transition | Notes |
| --- | --- | --- |
| 2026-05-07T12:37:17+08:00 | opened -> coding | Registered task and contract for a clarified project status model. |
| 2026-05-07T12:40:00+08:00 | coding -> verification | Implemented `taskStatus`, project row pills, and focused tests. |
| 2026-05-07T12:41:56+08:00 | verification -> done | Focused tests, typecheck, full tests, build, diff check, and real project probe passed. |
| 2026-05-07T12:41:56+08:00 | checkpoint | Product code committed as `e391eff Clarify project status model`. |
