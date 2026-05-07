# Agent State

## Repository Status

- Project type: local-first macOS app / developer tool
- Current focus: Terminal column scrollbars are hidden.
- Last controller run: 2026-05-07T19:49:39+08:00 opened `t-045-workbench-column-inset-balance`

## Repository Identity

- Git root: `<repo-root>`
- Is git repository: yes
- Current branch: main
- Default branch: main
- Remote origin: `git@github.com:SharkUI/SharkBay.git`
- GitHub repository: `git@github.com:SharkUI/SharkBay.git`
- Dirty worktree: no

## Current Task

- Task ID: none
- Phase: done
- Next action: Idle after T046 terminal scrollbar verification.
- Blocked by: none

## Recent Decisions

| Date | Decision | Source |
| --- | --- | --- |
| 2026-05-07T19:57:22+08:00 | Completed `t-046-hide-terminal-scrollbars` with hidden xterm scrollbars, preserved scrollback, and passing verification. | `.sharkbay/tasks/t-046-hide-terminal-scrollbars/verification.md` |
| 2026-05-07T19:55:51+08:00 | Opened `t-046-hide-terminal-scrollbars` to hide the middle terminal column scrollbar while preserving terminal scrollback. | `.sharkbay/tasks/t-046-hide-terminal-scrollbars/status.md` |
| 2026-05-07T19:53:20+08:00 | Completed `t-045-workbench-column-inset-balance` with equal top and bottom outer spacing for terminal/detail columns and passing verification. | `.sharkbay/tasks/t-045-workbench-column-inset-balance/verification.md` |
| 2026-05-07T19:49:39+08:00 | Opened `t-045-workbench-column-inset-balance` to restore equal top and bottom outer spacing for the terminal and right detail columns while preserving left traffic-light avoidance. | `.sharkbay/tasks/t-045-workbench-column-inset-balance/status.md` |
| 2026-05-07T19:45:49+08:00 | Completed `t-044-workbench-layout-polish` with left-column-only titlebar drag space, terminal bottom padding, taller right detail tabs, and passing verification. | `.sharkbay/tasks/t-044-workbench-layout-polish/verification.md` |
| 2026-05-07T19:43:28+08:00 | Opened `t-044-workbench-layout-polish` to constrain hidden-titlebar space to the left column, prevent terminal bottom-line clipping, and increase right detail tab height. | `.sharkbay/tasks/t-044-workbench-layout-polish/status.md` |
| 2026-05-07T19:24:35+08:00 | Completed `t-043-custom-app-icon` with repository icon assets, Electron BrowserWindow icon wiring, macOS Dock icon setup, and passing verification. | `.sharkbay/tasks/t-043-custom-app-icon/verification.md` |
| 2026-05-07T19:22:07+08:00 | Opened `t-043-custom-app-icon` to use the provided `~/Downloads/shark.png` asset as the SharkBay Electron app icon. | `.sharkbay/tasks/t-043-custom-app-icon/status.md` |
| 2026-05-07T14:09:19+08:00 | Completed `t-042-settings-two-column-redesign` with a left settings section selector, right content pane, preserved root controls, status section, and passing verification. | `.sharkbay/tasks/t-042-settings-two-column-redesign/verification.md` |
| 2026-05-07T14:01:02+08:00 | Opened `t-042-settings-two-column-redesign` to convert Settings into a conventional two-column settings page. | `.sharkbay/tasks/t-042-settings-two-column-redesign/status.md` |
| 2026-05-07T13:26:55+08:00 | Completed `t-041-settings-terminal-resize-guard` with renderer and backend terminal resize guards plus passing focused and full verification. | `.sharkbay/tasks/t-041-settings-terminal-resize-guard/verification.md` |
| 2026-05-07T13:23:04+08:00 | Opened `t-041-settings-terminal-resize-guard` to fix terminal resize errors when entering Settings. | `.sharkbay/tasks/t-041-settings-terminal-resize-guard/status.md` |
| 2026-05-07T12:41:56+08:00 | Committed `t-040-project-status-model` product changes as `e391eff Clarify project status model`. | `git commit -m "Clarify project status model"` |
| 2026-05-07T12:41:56+08:00 | Completed `t-040-project-status-model` with normalized `taskStatus` summaries, separate runner/status pills, Needs Action waiting fixes, and passing verification. | `.sharkbay/tasks/t-040-project-status-model/verification.md` |
| 2026-05-07T12:37:17+08:00 | Opened `t-040-project-status-model` to separate task queue state, runner execution state, and human waiting state in SharkBay project status display. | `.sharkbay/tasks/t-040-project-status-model/status.md` |
| 2026-05-07T11:26:00+08:00 | Committed T039 product changes as `9dd2d52 Add explicit legacy harness migration`. | `git commit -m "Add explicit legacy harness migration"` |
| 2026-05-07T11:24:00+08:00 | Completed T039 with explicit legacy harness migration, confirmed UI action, no silent cleanup, no `.gitignore` ownership, and passing verification. | `tasks/t-039-legacy-harness-file-cleanup/verification.md` |
| 2026-05-07T11:12:00+08:00 | Advanced T039 to coding with a contract that permits only explicit, confirmation-gated migration of recognized legacy harness files and forbids `.gitignore` changes. | `tasks/t-039-legacy-harness-file-cleanup/contract.md` |
| 2026-05-07T11:08:00+08:00 | Reviewed T038 and T039 against T037. T038 is satisfied by T037's setup behavior; T039 may proceed only as an explicit, human-gated legacy migration path that refuses mixed layouts and preserves unrelated root docs/tasks content. | `tasks/t-039-legacy-harness-file-cleanup/review.md` |
| 2026-05-07T10:55:00+08:00 | Completed `t-037-contained-sharkbay-harness-layout` with contained `.sharkbay` setup, legacy compatibility, no setup-owned `.gitignore` writes, passing checks, and product docs updated. | `tasks/t-037-contained-sharkbay-harness-layout/verification.md` |
| 2026-05-07T10:47:00+08:00 | Advanced `t-037-contained-sharkbay-harness-layout` to coding after recording a compatibility-first design, passing design review, and writing an implementation contract. | `tasks/t-037-contained-sharkbay-harness-layout/contract.md` |
| 2026-05-07T10:28:00+08:00 | Opened `t-037-contained-sharkbay-harness-layout` with follow-up backlog tasks `t-038-gitignore-agent-owned-setup-guidance` and `t-039-legacy-harness-file-cleanup` to reduce setup intrusion into external projects. | User request |
| 2026-05-07T00:07:00+08:00 | Committed `t-036-window-drag-region` as `166ecec Restore window drag region`. | `git commit -m "Restore window drag region"` |
| 2026-05-07T00:06:00+08:00 | Completed `t-036-window-drag-region` with a renderer drag strip, workspace traffic-light inset, passing checks, and Electron visual confirmation. | `tasks/t-036-window-drag-region/verification.md` |
| 2026-05-06T23:57:05+08:00 | Opened `t-036-window-drag-region` to restore window drag/double-click affordance after hiding the native macOS title bar and to move left sidebar content below the traffic-light controls. | User request |
| 2026-05-06T23:55:00+08:00 | Committed `t-035-native-titlebar-removal` as `2cd09cd Hide native macOS title bar`. | `git commit -m "Hide native macOS title bar"` |
| 2026-05-06T23:52:00+08:00 | Completed `t-035-native-titlebar-removal` by using Electron's `hiddenInset` macOS title bar style on the main `BrowserWindow` while preserving native window controls. | `tasks/t-035-native-titlebar-removal/verification.md` |
| 2026-05-06T23:44:25+08:00 | Opened `t-035-native-titlebar-removal` to hide the visible native macOS Electron title bar while keeping native window controls. | User request |
| 2026-05-06T23:37:13+08:00 | Completed `t-034-skip-existing-gitignore-setup` by skipping only the setup-seeded `.gitignore` when it already exists during existing-directory setup while preserving all other collision protections. | `tasks/t-034-skip-existing-gitignore-setup/verification.md` |
| 2026-05-06T23:35:57+08:00 | Opened `t-034-skip-existing-gitignore-setup` because Ripple setup currently refuses to continue when an existing project has a `.gitignore`, even though `.gitignore` is project-owned and should be preserved. | User screenshot |
| 2026-05-06T23:17:40+08:00 | Committed `t-033-remove-flat-side-panel-shells` as `3dd44b0 Remove side panel shells`. | `git commit -m "Remove side panel shells"` |
| 2026-05-06T23:16:30+08:00 | Completed `t-033-remove-flat-side-panel-shells` by removing the generic panel shell from the left and right workbench columns while preserving resizing, scrolling, terminal framing, and sticky right detail tabs. | `tasks/t-033-remove-flat-side-panel-shells/verification.md` |
| 2026-05-06T23:15:16+08:00 | Opened `t-033-remove-flat-side-panel-shells` to remove the remaining invisible generic panel shells from the left project column and right detail column. | User request |
| 2026-05-06T23:12:04+08:00 | Committed `t-032-workbench-panel-visual-polish` final CSS correction as `10bab09 Match detail tabs to window background`. | `git commit -m "Match detail tabs to window background"` |
| 2026-05-06T23:10:00+08:00 | Completed `t-032-workbench-panel-visual-polish` with transparent outer workbench panels, sticky right detail tabs, centered priority labels, and `P0` display support. | `tasks/t-032-workbench-panel-visual-polish/verification.md` |
| 2026-05-06T23:05:05+08:00 | Opened `t-032-workbench-panel-visual-polish` to flatten left/right rounded panel backgrounds, keep right detail tabs fixed during detail scrolling, and improve task priority label alignment. | User request |
| 2026-05-06T23:04:53+08:00 | Completed `t-031-backlog-task-metadata-detail`: artifact-less queue tasks now show queue metadata in task detail, and missing task artifact files no longer create harness error noise. | `tasks/t-031-backlog-task-metadata-detail/verification.md` |
| 2026-05-06T22:59:36+08:00 | Opened `t-031-backlog-task-metadata-detail` because AIGF backlog task `t-008` has queue metadata but no task artifact directory, and SharkBay currently hides that metadata behind a no-detail empty state. | User report |
| 2026-05-06T22:58:00+08:00 | Verified concurrent `.gitignore` restore and harness template sync changes are consistent: `.gitignore` is project-owned, template sync allowlist excludes it, and managed projects scan as current. | `tasks/t-030-exclude-gitignore-from-template-sync/verification.md` |
| 2026-05-06T22:25:00+08:00 | Opened `t-030-exclude-gitignore-from-template-sync` because project `.gitignore` should be setup-seeded but not owned by harness template refresh. | User request |
| 2026-05-06T22:16:00+08:00 | Committed `t-029-harness-template-sync-ui` as `ba2d551 Surface harness template sync status`. | `git commit -m "Surface harness template sync status"` |
| 2026-05-06T22:14:00+08:00 | Completed `t-029-harness-template-sync-ui` with visible harness stale/missing project row pills and a confirmed per-project sync panel. | `tasks/t-029-harness-template-sync-ui/verification.md` |
| 2026-05-06T22:05:00+08:00 | Opened `t-029-harness-template-sync-ui` because harness template sync existed only as scan data and hidden IPC, so restarting SharkBay showed no visible prompt. | User report |
| 2026-05-06T21:55:00+08:00 | Committed `t-028-harness-template-sync` as `dcecce4 Add harness template sync checks`. | `git commit -m "Add harness template sync checks"` |
| 2026-05-06T21:52:00+08:00 | Completed `t-028-harness-template-sync` with scan-visible template drift status and safe version-owned file update functions. | `tasks/t-028-harness-template-sync/verification.md` |
| 2026-05-06T21:49:00+08:00 | Implemented harness template sync as an explicit safe service plus scan-visible drift summary, without silent background mutation. | `tasks/t-028-harness-template-sync/verification.md` |
| 2026-05-06T21:46:00+08:00 | Classified `AGENTS.md`, `.agent/protocol.md`, `.agent/quality-rules.md`, and `.gitignore` as version-owned harness template files; project identity, queue/state, docs, and tasks remain project-owned and must not be overwritten by sync. | `tasks/t-028-harness-template-sync/spec.md` |
| 2026-05-06T21:40:17+08:00 | Opened `t-028-harness-template-sync` to keep installed Ripple harness files in managed projects current with SharkBay's tracked `templates/harness` source. | User request |
| 2026-05-06T21:10:09+08:00 | Completed `t-027-compact-right-detail-tabs` with commit `6df7a30`: compact right detail tabs, left-sidebar-scale tab typography, and the `NOT SETUP` divider removed. | `tasks/t-027-compact-right-detail-tabs/verification.md` |
| 2026-05-06T21:09:30+08:00 | Completed `t-026-public-harness-cleanup` with commit `06f89a2`; push is pending user confirmation. | `git commit -m "Stop tracking local harness state"` |
| 2026-05-06T21:07:29+08:00 | Opened `t-027-compact-right-detail-tabs` to replace the heavy right detail card tabs with a compact tab-strip treatment. | User request |
| 2026-05-06T21:04:00+08:00 | Opened `t-026-public-harness-cleanup` to remove SharkBay local harness state from public tracking while preserving product harness templates. | User request |
| 2026-05-06T20:45:21+08:00 | Pushed README refresh commit `0941329` to `origin/main`. | `git push origin main` |
| 2026-05-06T20:42:52+08:00 | Completed `t-025-readme-publish` with `README.md` refreshed for current SharkBay workbench capabilities and native terminal rebuild guidance. | `tasks/t-025-readme-publish/verification.md` |
| 2026-05-06T20:41:15+08:00 | Open `t-025-readme-publish` to refresh `README.md` and push the current `main` branch to origin. | User request |
| 2026-05-06T20:32:36+08:00 | Completed the `t-023-terminal-title-strategy` revision so `codex`, `claude`, and terminal monitor foreground apps keep process titles and OSC color responses no longer pollute tab titles. | `tasks/t-023-terminal-title-strategy/verification.md` |
| 2026-05-06T20:29:49+08:00 | Reopened `t-023-terminal-title-strategy` because Codex/xterm OSC color responses and interactive app input could overwrite the intended foreground app tab title. | User report |
| 2026-05-06T20:24:02+08:00 | Completed `t-024-project-aware-column-headings` with the terminal column titled by selected project name and redundant right detail project name/path headers removed. | `tasks/t-024-project-aware-column-headings/verification.md` |
| 2026-05-06T20:21:48+08:00 | Open `t-024-project-aware-column-headings` to title the terminal column with the selected project name and remove the redundant project name/path header from the right detail column. | User request |
| 2026-05-06T20:16:12+08:00 | Completed `t-023-terminal-title-strategy` with terminal tabs deriving titles from project-relative cwd or foreground occupying commands. | `tasks/t-023-terminal-title-strategy/verification.md` |
| 2026-05-06T20:09:07+08:00 | Open `t-023-terminal-title-strategy` to make terminal tabs show project-relative cwd by default and foreground occupying commands when more useful. | User request |
| 2026-05-06T20:05:19+08:00 | Completed `t-022-runner-task-registration` with task-first runner protocol rules and SharkBay diagnostics for missing, inactive, or mismatched runner tasks. | `tasks/t-022-runner-task-registration/verification.md` |
| 2026-05-06T19:58:01+08:00 | Open `t-022-runner-task-registration` to prevent runner-only work from staying invisible when task queue/state registration is missing. | User request |
| 2026-05-06T19:51:41+08:00 | Completed `t-021-harness-behavioral-discipline` with Behavioral Discipline rules applied to SharkBay, setup templates, AIBF, and AIGF. | `tasks/t-021-harness-behavioral-discipline/verification.md` |
| 2026-05-06T19:44:38+08:00 | Open `t-021-harness-behavioral-discipline` to add ambiguity, simplicity, traceability, and verification-mapping rules to SharkBay, templates, AIBF, and AIGF. | User request |
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
