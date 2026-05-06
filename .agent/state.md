# Agent State

## Repository Status

- Project type: local-first macOS app / developer tool
- Current focus: Right detail column card tabs are complete with flattened Decisions/Git lists, repository facts in Git, and Info limited to project-authored metadata
- Last controller run: 2026-05-06 simplified right detail tab content, moved repository facts to Git, and removed Track URLs from Info

## Repository Identity

- Git root: `<repo-root>`
- Is git repository: yes
- Current branch: main
- Default branch: main
- Remote origin: `git@github.com:SharkUI/SharkBay.git`
- GitHub repository: `git@github.com:SharkUI/SharkBay.git`
- Dirty worktree: no

## Current Task

- Task ID: `t-020-right-detail-card-tabs`
- Phase: done
- Next action: Ready for the next task.
- Blocked by: none

## Recent Decisions

| Date | Decision | Source |
| --- | --- | --- |
| 2026-05-05 | Initialized SharkBay from the project seed in `init.md`. | `init.md` |
| 2026-05-05 | Orient SharkBay as a macOS local app rather than a browser-only web app. | User answer |
| 2026-05-05 | Keep Codex edits scoped to the current project workspace; SharkBay will later manage only directories configured inside the app. | User answer |
| 2026-05-05 | Initialized git in the repository on branch `main`. | User approval |
| 2026-05-05 | Recorded intended GitHub repository URL `git@github.com:SharkUI/sharkbay.git`. | User answer |
| 2026-05-05 | Configured git remote origin as `git@github.com:SharkUI/sharkbay.git`. | Controller |
| 2026-05-05 | Accepted Electron + React + TypeScript + Vite as the default MVP stack for the macOS local app. | Controller default after user asked to continue |
| 2026-05-05 | Completed the MVP design artifact and advanced task `t-001-sharkbay-mvp-spec` to `design_review`. | Controller |
| 2026-05-05 | Moved task `t-001-sharkbay-mvp-spec` to `design_revision` because design review found one major issue. | `design-review.md` |
| 2026-05-05 | Revised the MVP design to address safe harness JSON writes, URL persistence, and safety verification findings. | `design.md` |
| 2026-05-05 | Second design review passed with blocker=0 and major=0; advanced task `t-001-sharkbay-mvp-spec` to `contract`. | `design-review.md` |
| 2026-05-05 | Implementation contract passed controller gate; advanced task `t-001-sharkbay-mvp-spec` to `coding`. | `contract.md` |
| 2026-05-05 | Completed the first MVP coding slice and recorded command evidence; advanced task `t-001-sharkbay-mvp-spec` to `code_review`. | `implementation.md` |
| 2026-05-05 | Moved task `t-001-sharkbay-mvp-spec` to `code_revision` because code review found one blocker and two major findings. | `code-review.md` |
| 2026-05-05 | Revised configured-root authority, symlink read/create safety, and URL mirror mismatch findings; returned task `t-001-sharkbay-mvp-spec` to `code_review`. | `implementation.md` |
| 2026-05-05 | Second code review passed with blocker=0 and major=0; advanced task `t-001-sharkbay-mvp-spec` to `verification`. | `code-review.md` |
| 2026-05-05 | Verification passed for the first SharkBay MVP coding slice; advanced task `t-001-sharkbay-mvp-spec` to `docs_update`. | `verification.md` |
| 2026-05-05 | Documentation updated and task `t-001-sharkbay-mvp-spec` marked done. | `status.md` |
| 2026-05-05 | Created task `t-002-self-hosting-ux` and advanced it from spec to design. | `tasks/t-002-self-hosting-ux/spec.md` |
| 2026-05-05 | Completed the `t-002` self-hosting workflow design and advanced it to `design_review`. | `tasks/t-002-self-hosting-ux/design.md` |
| 2026-05-05 | Moved `t-002-self-hosting-ux` to `design_revision` after design review found two major issues. | `tasks/t-002-self-hosting-ux/design-review.md` |
| 2026-05-05 | Revised `t-002` design and returned it to `design_review`. | `tasks/t-002-self-hosting-ux/design.md` |
| 2026-05-05 | Design review passed for `t-002-self-hosting-ux`; contract written and coding opened. | `tasks/t-002-self-hosting-ux/contract.md` |
| 2026-05-05 | Implemented `t-002` self-hosting workflow polish and advanced it to `code_review`. | `tasks/t-002-self-hosting-ux/implementation.md` |
| 2026-05-05 | Moved `t-002-self-hosting-ux` to `code_revision` after code review found a scan metadata issue. | `tasks/t-002-self-hosting-ux/code-review.md` |
| 2026-05-05 | Revised `t-002` scan metadata IPC and self-host marker test coverage; returned to `code_review`. | `tasks/t-002-self-hosting-ux/implementation.md` |
| 2026-05-05 | Second code review passed for `t-002-self-hosting-ux`; advanced to `verification`. | `tasks/t-002-self-hosting-ux/code-review.md` |
| 2026-05-05 | Verification passed for `t-002-self-hosting-ux`; advanced to `docs_update`. | `tasks/t-002-self-hosting-ux/verification.md` |
| 2026-05-05 | Documentation updated and task `t-002-self-hosting-ux` marked done. | `tasks/t-002-self-hosting-ux/status.md` |
| 2026-05-05 | Created task `t-003-dogfood-self-hosting-flow` for a real self-hosting dogfood pass and opened coding. | `tasks/t-003-dogfood-self-hosting-flow/status.md` |
| 2026-05-05 | Implemented `t-003` dogfood fixes and advanced the task to `code_review`. | `tasks/t-003-dogfood-self-hosting-flow/implementation.md` |
| 2026-05-05 | Moved `t-003-dogfood-self-hosting-flow` to `code_revision` after review found one major and one minor issue. | `tasks/t-003-dogfood-self-hosting-flow/code-review.md` |
| 2026-05-05 | Addressed `t-003` code review findings and returned the task to `code_review`. | `tasks/t-003-dogfood-self-hosting-flow/code-review.md` |
| 2026-05-05 | Second code review passed for `t-003-dogfood-self-hosting-flow`; advanced to `verification`. | `tasks/t-003-dogfood-self-hosting-flow/code-review.md` |
| 2026-05-05 | Verification and docs update passed for `t-003-dogfood-self-hosting-flow`; marked done. | `tasks/t-003-dogfood-self-hosting-flow/verification.md` |
| 2026-05-05 | Created `t-004-user-centered-project-workbench` as a UI-first project workbench redesign task. | `tasks/t-004-user-centered-project-workbench/status.md` |
| 2026-05-05 | Added git checkpoint discipline to the controller protocol so each phase or coherent coding slice is committed. | `.agent/protocol.md` |
| 2026-05-05 | Completed `t-004-user-centered-project-workbench` with a project-first UI, Settings-based setup controls, and verified checks. | `tasks/t-004-user-centered-project-workbench/status.md` |
| 2026-05-05 | Opened `t-005-root-child-discovery` to list ordinary root child folders and show managed/not-setup status. | `tasks/t-005-root-child-discovery/status.md` |
| 2026-05-05 | Designed `t-005` around a read-only `ProjectCandidate` layer alongside existing managed `ProjectSummary` scanning. | `tasks/t-005-root-child-discovery/design.md` |
| 2026-05-05 | Design review passed for `t-005-root-child-discovery` and coding opened with an additive candidates contract. | `tasks/t-005-root-child-discovery/contract.md` |
| 2026-05-05 | Completed `t-005-root-child-discovery` with read-only root child candidates and managed/not-setup project rows. | `tasks/t-005-root-child-discovery/status.md` |
| 2026-05-05 | Inserted `t-006-autonomous-ux-polish` before Ripple setup and moved the write-safety task to `t-007-ripple-setup-flow`. | `tasks/t-006-autonomous-ux-polish/status.md` |
| 2026-05-05 | Completed `t-006-autonomous-ux-polish` with a self-reviewed UX cleanup of project rows, not-setup detail, and queue/detail signals. | `tasks/t-006-autonomous-ux-polish/verification.md` |
| 2026-05-05 | Queued `t-008-project-authored-url-metadata` so project agents can later maintain local, test, and deploy URLs from project documents after setup or deployment. | User request |
| 2026-05-05 | Opened `t-007-ripple-setup-flow` as the active task. | `.agent/queue.json` |
| 2026-05-05 | Advanced `t-007-ripple-setup-flow` to coding after spec, design review, and contract passed. | `tasks/t-007-ripple-setup-flow/contract.md` |
| 2026-05-05 | Implemented `t-007-ripple-setup-flow` with confirmed existing-directory setup and no-overwrite template preflight. | `tasks/t-007-ripple-setup-flow/implementation.md` |
| 2026-05-05 | Completed `t-007-ripple-setup-flow` and left `t-008-project-authored-url-metadata` as the next backlog task. | `tasks/t-007-ripple-setup-flow/verification.md` |
| 2026-05-05T18:46:51+08:00 | Decision and Git history surfaces should show the latest five records in project detail, with full history opened inside the right detail column. | User request |
| 2026-05-05T18:53:18+08:00 | History timestamps should be shown as readable relative times on each item, and backlog tasks must remain visible in the project detail queue. | User request |
| 2026-05-05T19:02:00+08:00 | Expanded `t-008` from URL metadata to project-authored developer metadata that keeps SharkBay project details read-only where possible. | User request |
| 2026-05-05T19:05:00+08:00 | Use `.agent/development.json` for stable project-authored developer metadata and keep SharkBay's first display read-only and summary-focused. | `tasks/t-008-project-authored-url-metadata/design.md` |
| 2026-05-05T19:15:00+08:00 | Implemented the first read-only developer metadata slice with optional `.agent/development.json` reading and a compact Project Info summary. | `tasks/t-008-project-authored-url-metadata/implementation.md` |
| 2026-05-05T19:16:00+08:00 | Completed `t-008-project-authored-url-metadata` with verification passing. | `tasks/t-008-project-authored-url-metadata/verification.md` |
| 2026-05-05T19:35:00+08:00 | Treat `Needs Action` as a human intervention surface rather than a dirty-worktree or generic phase list. | `tasks/t-009-human-intervention-policy/spec.md` |
| 2026-05-05T19:47:00+08:00 | Completed `t-009-human-intervention-policy` after committing the implementation checkpoint first. | `tasks/t-009-human-intervention-policy/status.md` |
| 2026-05-05T19:50:58+08:00 | Opened `t-010-agent-onboarding-instructions` to define setup-time agent entrypoint instructions for Ripple projects. | User request |
| 2026-05-05T20:08:50+08:00 | Synchronized SharkBay repository identity and git origin to `git@github.com:SharkUI/SharkBay.git` after the GitHub repository casing changed. | User request |
| 2026-05-05T20:14:48+08:00 | Scrubbed public working-tree references to private local filesystem paths before publishing the repository. | User request |
| 2026-05-05T20:20:00+08:00 | Advanced `t-010-agent-onboarding-instructions` from intake to spec with a Codex-first `AGENTS.md` onboarding policy and no-overwrite setup behavior. | `tasks/t-010-agent-onboarding-instructions/spec.md` |
| 2026-05-05T21:10:47+08:00 | Advanced `t-010-agent-onboarding-instructions` from spec to design with a root `AGENTS.md` template and no-overwrite setup behavior. | `tasks/t-010-agent-onboarding-instructions/design.md` |
| 2026-05-05T21:11:54+08:00 | Design review passed for `t-010-agent-onboarding-instructions` with blocker=0 and major=0. | `tasks/t-010-agent-onboarding-instructions/design-review.md` |
| 2026-05-05T21:12:31+08:00 | Contract passed for `t-010-agent-onboarding-instructions`; coding may begin because dependency `t-009-human-intervention-policy` is done. | `tasks/t-010-agent-onboarding-instructions/contract.md` |
| 2026-05-05T21:13:17+08:00 | Opened coding for `t-010-agent-onboarding-instructions` after confirming dependency `t-009-human-intervention-policy` is done. | `tasks/t-010-agent-onboarding-instructions/status.md` |
| 2026-05-05T21:15:02+08:00 | Implemented the `t-010` `AGENTS.md` template and focused setup/prompt tests; required checks passed except dev startup is blocked by occupied port 5173 with an existing server returning HTTP 200. | `tasks/t-010-agent-onboarding-instructions/implementation.md` |
| 2026-05-05T21:17:23+08:00 | Code review passed for `t-010-agent-onboarding-instructions` with blocker=0 and major=0; one minor status-note issue was fixed. | `tasks/t-010-agent-onboarding-instructions/code-review.md` |
| 2026-05-05T21:18:34+08:00 | Verification passed for `t-010-agent-onboarding-instructions`; dev startup is blocked by occupied port 5173, and the existing server returns HTTP 200. | `tasks/t-010-agent-onboarding-instructions/verification.md` |
| 2026-05-05T21:19:26+08:00 | Documentation updated and task `t-010-agent-onboarding-instructions` marked done. | `tasks/t-010-agent-onboarding-instructions/status.md` |
| 2026-05-05T21:25:00+08:00 | Opened `t-011-runner-lifecycle-heartbeat` and designed a cooperative runner lease and heartbeat model separate from harness phase. | `tasks/t-011-runner-lifecycle-heartbeat/design.md` |
| 2026-05-05T21:27:00+08:00 | Design review passed for `t-011-runner-lifecycle-heartbeat` with blocker=0 and major=0; contract may begin. | `tasks/t-011-runner-lifecycle-heartbeat/design-review.md` |
| 2026-05-05T21:29:00+08:00 | Contract passed for `t-011-runner-lifecycle-heartbeat`; coding may begin on the first read-only runner lifecycle slice. | `tasks/t-011-runner-lifecycle-heartbeat/contract.md` |
| 2026-05-05T21:51:00+08:00 | Code review passed for `t-011-runner-lifecycle-heartbeat` after implementing runner metadata reading, handoff semantics, and protocol docs. | `tasks/t-011-runner-lifecycle-heartbeat/code-review.md` |
| 2026-05-05T21:53:00+08:00 | Verification passed for `t-011-runner-lifecycle-heartbeat`; runner lifecycle is now read from cooperative metadata instead of inferred from task phase. | `tasks/t-011-runner-lifecycle-heartbeat/verification.md` |
| 2026-05-05T21:55:00+08:00 | Completed `t-011-runner-lifecycle-heartbeat` with separate runner lifecycle metadata, Needs Action semantics, and protocol guidance. | `tasks/t-011-runner-lifecycle-heartbeat/status.md` |
| 2026-05-05T22:49:00+08:00 | Fixed task list visibility by matching SharkBay's queue reader to section-specific harness queue rules and adding read-only task directory fallback rows. | `tasks/t-012-task-directory-queue-fallback/status.md` |
| 2026-05-05T23:00:00+08:00 | Moved task artifacts out of the default project overview and added a full-column task drilldown from the Tasks list. | `tasks/t-013-task-detail-drilldown/status.md` |
| 2026-05-06T16:47:19+08:00 | Open SharkBay Settings from the macOS application menu instead of relying on an in-panel settings button. | `tasks/t-018-macos-settings-menu/implementation.md` |
| 2026-05-06T16:53:27+08:00 | Removed the left project panel's search, phase, Dirty, Blocked, refresh, and Settings controls. | `tasks/t-018-macos-settings-menu/implementation.md` |
| 2026-05-06T17:01:51+08:00 | Keep `DashboardView` mounted while Settings is open so terminal spaces, tabs, and xterm instances persist across Settings navigation. | `tasks/t-019-preserve-terminals-across-settings/implementation.md` |
| 2026-05-06T18:50:09+08:00 | Open `t-020-right-detail-card-tabs` to convert the right detail column into card-style tabs for Tasks, Decisions, Git, and Info, with handoff remaining inside Tasks. | User request |
| 2026-05-06T18:57:51+08:00 | Completed `t-020-right-detail-card-tabs` with card-style right detail tabs and Handoff scoped to Tasks. | `tasks/t-020-right-detail-card-tabs/verification.md` |
| 2026-05-06T19:09:33+08:00 | Repaired right detail card tabs to preserve tab-local state across switches and added explicit tab accessibility links and keyboard navigation. | `tasks/t-020-right-detail-card-tabs/implementation.md` |
| 2026-05-06T19:29:24+08:00 | Flattened right detail tab content: current task is the first task row, Decisions and Git show complete lists directly, repository facts moved to Git, and Info no longer shows Track URLs. | `tasks/t-020-right-detail-card-tabs/implementation.md` |

## Open Questions

| Question | Needed For | Owner |
| --- | --- | --- |
| none | none | none |
