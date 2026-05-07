# Implementation: Right Detail Card Tabs

## Summary

Implemented the managed project right detail column as four card-style tabs:

- Tasks
- Decisions
- Git
- Info

Tasks now owns the task queue, diagnostics, and Handoff / next-action prompt panel; the current task is represented by the first task-list row instead of a separate summary card. Decisions renders the full decision list directly. Git renders repository facts and the full git event list directly. Info renders only project-authored development metadata.

## Follow-up Repair: Stateful Tabs

2026-05-06T19:09:33+08:00

Repaired the tab implementation so Tasks, Decisions, Git, and Info panels stay mounted while inactive and are hidden with the `hidden` attribute. This prevents tab-local state from being discarded when switching sections, including generated handoff prompts and unsaved URL edits.

Also connected each tab to its panel with `aria-controls` / `aria-labelledby` and added arrow-key, Home, and End keyboard navigation for the tab strip.

## Follow-up Repair: Flattened Tab Content

2026-05-06T19:29:24+08:00

Repaired the right detail tabs to match the latest user layout rules:

- Removed the separate `Current Task` card from Tasks and forced the active task row to sort first in the task list.
- Flattened Decisions so it shows the complete decision list directly, without a `Recent Decisions` wrapper, title, or `View all` drilldown.
- Flattened Git so it shows repository facts and the complete git event list directly, without a `Git History` wrapper, title, or `View all` drilldown.
- Moved repository information out of Info and into Git.
- Removed tracked URL editing from Info.
- Let repository fact values wrap so long paths and URLs remain readable instead of being truncated.

## Files Changed

- `src/renderer/App.tsx`
- `src/styles/app.css`
- `tasks/t-020-right-detail-card-tabs/*`
- `.agent/queue.json`
- `.agent/queue.md`
- `.agent/state.json`
- `.agent/state.md`
- `docs/task.md`

## User-Visible Behavior

- Selecting a managed project shows four compact card tabs in the right detail column.
- The default tab is Tasks.
- Tasks uses the first task-list row as the current task surface.
- Handoff generation and copy controls appear only inside Tasks.
- Decisions shows the full decision list directly.
- Git shows repository facts plus the full git event list directly.
- Info shows only project-authored development metadata.

## Developer Metadata

`.agent/development.json` did not change.

## Checks

- `npm run typecheck` passed.
- `npm test` passed with 51 tests.
- `npm run build` passed.
- `git diff --check` passed.
- Vite dev server started on `http://127.0.0.1:5174/`; HTTP smoke returned `200 OK`.
- Follow-up desktop checks in the running Electron SharkBay window confirmed Tasks, Decisions, Git, and Info switch correctly, that flattened Decisions/Git content is visible, and that Info no longer shows repository facts or tracked URL controls.

## Known Risks

- `agent-browser` and the Browser Use Node REPL tool were unavailable in this environment, so the follow-up visual check used the running Electron app through desktop automation plus HTTP smoke evidence.
