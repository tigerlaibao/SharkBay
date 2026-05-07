# Contract: Right Detail Card Tabs

## Done Criteria

- Managed project right detail column renders Tasks, Decisions, Git, and Info card-style tabs.
- Tasks tab contains handoff / next-action prompt controls.
- Decisions and Git tab content is separated from Tasks and shows full lists directly.
- Git tab contains repository facts.
- Info tab contains project-authored development metadata only.
- Task queue row drilldown still opens task artifact details.
- Required checks pass and evidence is recorded.

## Files In Scope

- `src/renderer/App.tsx`
- `src/styles/app.css`
- `tasks/t-020-right-detail-card-tabs/*`
- `.agent/queue.json`
- `.agent/queue.md`
- `.agent/state.json`
- `.agent/state.md`
- `.agent/runner.json`
- `docs/task.md`

## Files Out Of Scope

- `src/main/*`
- `electron/*`
- `src/shared/*`
- `package.json`
- `package-lock.json`
- terminal spawning behavior
- scanner and harness reader behavior

## Required Checks

- `npm run typecheck`
- `npm test`
- `npm run build`
- `git diff --check`
- Dev-server HTTP smoke check; browser check if the local browser tool is available.

## Stop Conditions

- Stop before changing main-process filesystem authority, scanner behavior, or terminal spawning.
- Stop before adding a new persisted setting or migration.
- Stop if existing task drilldown cannot be retained without broader redesign.

## Developer Metadata

No `.agent/development.json` change is expected.
