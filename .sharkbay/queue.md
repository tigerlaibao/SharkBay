# Agent Queue

## Active

| Priority | Task ID | Title | Phase | Depends On | Status |
| --- | --- | --- | --- | --- | --- |

## Backlog

| Priority | Task ID | Title | Depends On | Notes |
| --- | --- | --- | --- | --- |

## Done

| Task ID | Title | Completed |
| --- | --- | --- |
| `t-052-theme-icon-polish` | Polish day/night icons and theme colors | 2026-05-08 |
| `t-051-day-night-theme-icons` | Add day and night app themes with matching icons | 2026-05-08 |
| `t-050-project-icons` | Add project icons to the left project list | 2026-05-08 |
| `t-048-macos-packaging-config` | Add macOS packaging config | 2026-05-07 |
| `t-049-packaged-app-blank-screen` | Fix packaged macOS app blank screen | 2026-05-07 |
| `t-047-hide-xterm-custom-scrollbar` | Hide xterm custom scrollbar | 2026-05-07 |
| `t-046-hide-terminal-scrollbars` | Hide terminal scrollbars | 2026-05-07 |
| `t-045-workbench-column-inset-balance` | Balance workbench column top and bottom inset | 2026-05-07 |
| `t-044-workbench-layout-polish` | Polish workbench titlebar, terminal, and detail tabs | 2026-05-07 |
| `t-043-custom-app-icon` | Use shark image as SharkBay app icon | 2026-05-07 |
| `t-042-settings-two-column-redesign` | Redesign Settings as a two-column settings page | 2026-05-07 |
| `t-041-settings-terminal-resize-guard` | Guard terminal resize when entering Settings | 2026-05-07 |
| `t-040-project-status-model` | Clarify project task, runner, and waiting states | 2026-05-07 |
| `t-039-legacy-harness-file-cleanup` | Clean up legacy root harness files after `.sharkbay` compatibility lands | 2026-05-07 |
| `t-038-gitignore-agent-owned-setup-guidance` | Delegate setup gitignore changes to the target project agent | 2026-05-07 |
| `t-037-contained-sharkbay-harness-layout` | Move new harness installs into a contained `.sharkbay` layout | 2026-05-07 |
| `t-001-sharkbay-mvp-spec` | Define SharkBay MVP product, architecture, and implementation plan | 2026-05-05 |
| `t-002-self-hosting-ux` | Polish the self-hosting dashboard workflow | 2026-05-05 |
| `t-003-dogfood-self-hosting-flow` | Dogfood the self-hosting workflow and fix first-use friction | 2026-05-05 |
| `t-004-user-centered-project-workbench` | Reframe SharkBay as a user-centered project workbench | 2026-05-05 |
| `t-005-root-child-discovery` | Discover ordinary root child projects and show Ripple setup status | 2026-05-05 |
| `t-006-autonomous-ux-polish` | Autonomous UX discipline polish | 2026-05-05 |
| `t-007-ripple-setup-flow` | Design confirmation-gated Ripple setup for existing projects | 2026-05-05 |
| `t-008-project-authored-url-metadata` | Design project-authored developer metadata | 2026-05-05 |
| `t-009-human-intervention-policy` | Define human intervention signals | 2026-05-05 |
| `t-010-agent-onboarding-instructions` | Ensure setup projects instruct agents to follow Ripple harness | 2026-05-05 |
| `t-011-runner-lifecycle-heartbeat` | Separate runner lifecycle from harness phase | 2026-05-05 |
| `t-012-task-directory-queue-fallback` | Show task directories when queue metadata is incomplete | 2026-05-05 |
| `t-013-task-detail-drilldown` | Task detail drilldown in project sidebar | 2026-05-05 |
| `t-014-terminal-integration` | Integrate project terminal tabs | 2026-05-06 |
| `t-015-xterm-node-pty-terminal-spaces` | Replace terminal with xterm and node-pty project spaces | 2026-05-06 |
| `t-016-resizable-workbench-columns` | Make workbench columns resizable | 2026-05-06 |
| `t-017-minimum-default-columns` | Initialize workbench columns at minimum widths | 2026-05-06 |
| `t-018-macos-settings-menu` | Open Settings from the macOS app menu | 2026-05-06 |
| `t-019-preserve-terminals-across-settings` | Preserve terminal spaces across Settings navigation | 2026-05-06 |
| `t-020-right-detail-card-tabs` | Convert right detail column into card tabs | 2026-05-06 |
| `t-021-harness-behavioral-discipline` | Add behavioral discipline to Ripple harnesses | 2026-05-06 |
| `t-022-runner-task-registration` | Make runner work visible only after task registration | 2026-05-06 |
| `t-023-terminal-title-strategy` | Improve terminal tab title strategy | 2026-05-06 |
| `t-024-project-aware-column-headings` | Project-aware workbench column headings | 2026-05-06 |
| `t-025-readme-publish` | Refresh README and publish local commits | 2026-05-06 |
| `t-026-public-harness-cleanup` | Clean public repository harness state and audit tracked content | 2026-05-06 |
| `t-027-compact-right-detail-tabs` | Compact right detail tabs | 2026-05-06 |
| `t-028-harness-template-sync` | Keep installed Ripple harness files current from tracked templates | 2026-05-06 |
| `t-029-harness-template-sync-ui` | Surface harness template drift and explicit sync in the UI | 2026-05-06 |
| `t-030-exclude-gitignore-from-template-sync` | Exclude project `.gitignore` from harness template sync | 2026-05-06 |
| `t-031-backlog-task-metadata-detail` | Show queue metadata for backlog tasks without artifacts | 2026-05-06 |
| `t-032-workbench-panel-visual-polish` | Workbench panel visual polish | 2026-05-06 |
| `t-033-remove-flat-side-panel-shells` | Remove flat side panel shells | 2026-05-06 |
| `t-034-skip-existing-gitignore-setup` | Skip existing project gitignore during Ripple setup | 2026-05-06 |
| `t-035-native-titlebar-removal` | Hide native macOS title bar | 2026-05-06 |
| `t-036-window-drag-region` | Restore draggable window region | 2026-05-07 |

## Rules

- Highest priority active task is selected first.
- Lower number means higher priority.
- Do not start backlog tasks until they are moved to Active.
- Keep phase in sync with `tasks/<task-id>/status.md`.
- Treat `Depends On` as a hard lock before `coding`.
- If a dependency is not `done`, set the blocked task phase to `blocked` and record the blocker in `tasks/<task-id>/status.md`.
