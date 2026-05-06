# T-020: Convert right detail column into card tabs

- Status: done
- Phase: done
- Priority: 1
- Depends on: `t-019-preserve-terminals-across-settings`
- Created: 2026-05-06T18:50:09+08:00
- Owner: Codex
- Blocked by: none

## User Goal

Convert the right detail column into four card-style tabs:

1. Tasks
2. Decisions
3. Git
4. Info

Keep handoff/next-action prompt controls inside the Tasks tab.

## Current Plan

- Implement tab state in the right detail pane.
- Move task queue, active task, diagnostics, and handoff prompt into Tasks.
- Move decision history into Decisions, git history into Git, and project metadata/URLs into Info.
- Keep task drilldown behavior reachable from Tasks.
- Verify with typecheck, tests, build, diff check, and a dev-server smoke check when possible.

## Phase History

- 2026-05-06T18:50:09+08:00: Intake captured from user request.
- 2026-05-06T18:50:09+08:00: Spec, design, design review, and contract completed because scope is narrow and dependency `t-019` is done.
- 2026-05-06T18:50:09+08:00: Coding opened.
- 2026-05-06T18:57:51+08:00: Implementation, code review, and verification passed; task marked done.

## Verification Summary

- `npm run typecheck`: passed.
- `npm test`: passed with 51 tests.
- `npm run build`: passed.
- `git diff --check`: passed.
- Dev-server HTTP smoke on `http://127.0.0.1:5174/`: returned `200 OK`.
- Browser screenshot check could not run because `agent-browser` is unavailable.

## Final Outcome

The managed project right detail column now uses card-style tabs for Tasks, Decisions, Git, and Info. Handoff remains inside Tasks.

## Open Questions

- none
