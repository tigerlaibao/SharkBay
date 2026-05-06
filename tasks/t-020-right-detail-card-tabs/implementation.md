# Implementation: Right Detail Card Tabs

## Summary

Implemented the managed project right detail column as four card-style tabs:

- Tasks
- Decisions
- Git
- Info

Tasks now owns the current task summary, task queue, diagnostics, and Handoff / next-action prompt panel. Decisions and Git have their own tab content and retain the existing full-history pages. Info now owns repository facts, tracked URL editing, and project-authored development metadata.

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

## Known Risks

- Browser screenshot verification could not run because `agent-browser` is not installed in this environment.
