# Implementation: Right Detail Card Tabs

## Summary

Implemented the managed project right detail column as four card-style tabs:

- Tasks
- Decisions
- Git
- Info

Tasks now owns the current task summary, task queue, diagnostics, and Handoff / next-action prompt panel. Decisions and Git have their own tab content and retain the existing full-history pages. Info now owns repository facts, tracked URL editing, and project-authored development metadata.

## Follow-up Repair: Stateful Tabs

2026-05-06T19:09:33+08:00

Repaired the tab implementation so Tasks, Decisions, Git, and Info panels stay mounted while inactive and are hidden with the `hidden` attribute. This prevents tab-local state from being discarded when switching sections, including generated handoff prompts and unsaved URL edits.

Also connected each tab to its panel with `aria-controls` / `aria-labelledby` and added arrow-key, Home, and End keyboard navigation for the tab strip.

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
- Handoff generation and copy controls appear only inside Tasks.
- Decisions and Git no longer share the default task overview.
- URL editing moved into Info instead of a separate settings drilldown.

## Developer Metadata

`.agent/development.json` did not change.

## Checks

- `npm run typecheck` passed.
- `npm test` passed with 51 tests.
- `npm run build` passed.
- `git diff --check` passed.
- Vite dev server started on `http://127.0.0.1:5174/`; HTTP smoke returned `200 OK`.
- Follow-up desktop check in the running Electron SharkBay window confirmed Tasks, Decisions, Git, and Info switch correctly.

## Known Risks

- `agent-browser` and the Browser Use Node REPL tool were unavailable in this environment, so the follow-up visual check used the running Electron app through desktop automation plus HTTP smoke evidence.
