# Task Status

## Metadata

| Field | Value |
| --- | --- |
| Task ID | `t-004-user-centered-project-workbench` |
| Title | Reframe SharkBay as a user-centered project workbench |
| Priority | 1 |
| Phase | done |
| Owner Role | Coder |
| Depends On | `t-003-dogfood-self-hosting-flow` |
| Created | 2026-05-05 |
| Updated | 2026-05-05 |

## Goal

Reduce visual overload and reframe the app around projects first, with Ripple/harness state as one project capability rather than the whole interface.

## Scope

In scope:

- Move low-frequency roots and create-repo controls out of the main dashboard and into Settings.
- Rename user-facing harness language toward Ripple where it clarifies the product model.
- Make the dashboard emphasize the selected project, status, current task, local URLs, and next action.
- Hide dense harness internals behind secondary panels/tabs.
- Record the next backend step for root child discovery and one-click Ripple adoption.

Out of scope:

- Scanning all non-harness root child directories in the backend.
- Injecting Ripple files into existing non-harness directories.
- Starting, stopping, or restarting dev servers.
- GitHub API integration or deployment command execution.
- Direct Codex execution from the app.

## Current Gate

| Gate | Status | Notes |
| --- | --- | --- |
| Dependencies | pass | `t-003-dogfood-self-hosting-flow` is done. |
| Spec | pass | User-centered project/Ripple model and acceptance criteria are recorded in `spec.md`. |
| Design review | pass | This is a narrow UI-first slice; backend expansion is deferred. |
| Contract | pass | Allowed files and checks are recorded in `contract.md`. |
| Code review | pass | No blocker or major findings; minor copy issue fixed. |
| Verification | pass | `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check` passed. |
| Docs update | pass | Product/task docs updated for project-first workbench model. |

## Next Action

Start the next backend slice for ordinary root child discovery and one-click Ripple setup.

## Open Questions

| Question | Blocks Phase | Owner |
| --- | --- | --- |
| What exactly should “Ripple” be named in public UI? | no | Product follow-up |

## History

| Date | Phase | Summary |
| --- | --- | --- |
| 2026-05-05 | intake -> coding | User gave product critique; created a narrow UI-first task with spec/design/contract and opened coding. |
| 2026-05-05 | coding -> code_review | Reframed the UI around Projects/Settings and committed `2cddd14`. |
| 2026-05-05 | code_review -> verification | Follow-up review found no blocking issues; one copy note was fixed and committed in `955307b`. |
| 2026-05-05 | verification -> docs_update | Typecheck, full tests, build, and diff check passed. |
| 2026-05-05 | docs_update -> done | Product/task docs updated; task completed. |
