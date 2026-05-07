# Design: Right Detail Card Tabs

## Behavior

`ProjectDetailPane` will own a local tab state with `tasks` as the default. The tab strip will render as four card-like buttons at the top of the right column. Selecting a tab changes only the content under the tab strip.

The existing `DetailMode` value for `task` will continue to support full-column task drilldown. Decisions and Git render their full lists directly inside their tabs, so they do not need separate full-history drilldowns.

## Content Mapping

- Tasks:
  - task queue
  - diagnostics
  - handoff / next-action prompt panel
  - active task as the first row in the task queue
- Decisions:
  - full decision list directly in the tab
- Git:
  - repository facts
  - full git event list directly in the tab
- Info:
  - project info/development metadata

## UI Notes

Tabs should read as compact cards, not navigation pills. The right column is a dense operational surface, so labels should stay short and the cards should not add duplicate counts or explanatory text unless the content needs an empty state.

## Data/API Impact

Renderer-only change. No IPC, schema, scanner, or persisted storage changes are required.

## Files Likely To Change

- `src/renderer/App.tsx`
- `src/styles/app.css`
- `tasks/t-020-right-detail-card-tabs/*`
- `.agent/*`
- `docs/task.md`

## Risks

- The right column can become too tall if Tasks keeps every existing overview panel. Mitigation: move Info, Decisions, and Git out of Tasks.
- Task drilldown could lose its back path. Mitigation: retain the existing detail mode and back to project overview behavior.
- Hidden terminal preservation should not be affected. Mitigation: keep changes inside `ProjectDetailPane`.

## Verification

- `npm run typecheck`
- `npm test`
- `npm run build`
- `git diff --check`
- Dev-server HTTP smoke check, and browser/screenshot check if available.
