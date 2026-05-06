# Spec: Right Detail Card Tabs

## Scope

The right detail column for a selected managed project should become a compact card-tab surface with four top-level tabs:

- Tasks
- Decisions
- Git
- Info

The user should be able to switch between the tabs without changing the selected project, selected terminal space, or left project list. The task detail drilldown can remain inside the right column and should be reachable from the Tasks tab.

## Requirements

- The default tab should be Tasks.
- The Handoff / next-action prompt flow must stay in Tasks.
- Tasks must include the active task summary, task queue, diagnostics, and task drilldown entry points.
- Decisions must show recent decisions and allow viewing full decision history in the right column.
- Git must show git history and allow viewing full git history in the right column.
- Info must show the project info/developer metadata, URL editing surface, and repository facts.
- Not-setup projects can keep their existing setup detail; this task only targets managed project detail.

## Non-Goals

- No changes to scanner, repo reader, terminal authority, or harness parsing.
- No new persisted user preference for the active tab in this slice.
- No direct Codex execution or background automation.

## Acceptance Criteria

- Right managed-project detail has four visible card-style tabs labeled Tasks, Decisions, Git, and Info.
- Handoff prompt generation is visible only under Tasks.
- Decisions and Git content are no longer mixed into the default task overview.
- Info contains project facts and URL controls.
- Existing task drilldown from task rows still works.
- Required checks pass or any inability to run is recorded.
