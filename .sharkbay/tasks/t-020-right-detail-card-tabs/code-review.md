# Code Review: Right Detail Card Tabs

## Findings

- blocker: 0
- major: 0
- minor: 0

## Follow-up Review

2026-05-06T19:09:33+08:00

- blocker: 0
- major: 0
- minor: 0

The repair keeps inactive tab panels mounted, so stateful tab content is no longer reset by ordinary tab switching. The inactive panels are hidden with `hidden` and an explicit CSS rule, and each tab now has matching `aria-controls`, panel `aria-labelledby`, and keyboard navigation for Left/Right/Up/Down/Home/End.

## Second Follow-up Review

2026-05-06T19:29:24+08:00

- blocker: 0
- major: 0
- minor: 0

The second repair is a renderer/CSS-only simplification. It removes redundant wrapper cards and full-history drilldowns, keeps the active task discoverable by sorting it first in the task list, moves repository facts into Git, removes tracked URL editing from Info, and changes repository fact values to wrap rather than truncate.

## Review Notes

- The implementation stays within the renderer/UI scope named in `contract.md`.
- Handoff prompt rendering is limited to `TasksDetailTab`.
- Decisions, Git, and Info content are separated by local tab state and do not change scanner, IPC, terminal, or harness parsing behavior.
- Existing task drilldown is retained through the previous `detailMode="task"` path.
- The previous right-column URL settings icon and page were removed, and the second follow-up removes the Info-tab URL editor entirely.
- Follow-up repair remains renderer/CSS-only and does not alter scanner, IPC, terminal, or persisted storage behavior.

## Evidence

- `npm run typecheck`: exit 0.
- `npm test`: exit 0, 10 files passed, 51 tests passed.
- `npm run build`: exit 0.
- `git diff --check`: exit 0.
- Follow-up desktop check: Tasks, Decisions, Git, and Info switched correctly in the running Electron app.
- Second follow-up desktop check: Tasks has no `Current Task` card, Decisions and Git are flattened with no `View all`, Git contains repository facts, and Info has no Track URLs controls.

## Gate

Pass. Verification may proceed.
