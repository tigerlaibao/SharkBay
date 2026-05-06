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

## Rules

- Highest priority active task is selected first.
- Lower number means higher priority.
- Do not start backlog tasks until they are moved to Active.
- Keep phase in sync with `tasks/<task-id>/status.md`.
- Treat `Depends On` as a hard lock before `coding`.
- If a dependency is not `done`, set the blocked task phase to `blocked` and record the blocker in `tasks/<task-id>/status.md`.
