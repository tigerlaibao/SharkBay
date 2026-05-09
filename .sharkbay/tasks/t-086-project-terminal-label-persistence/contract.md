# Implementation Contract

## Scope

- Keep left project list terminal activity labels visible for each project based on that project's terminal tabs, independent of which project is currently selected.
- Render `idle` terminal labels with the yellow/done visual treatment.
- Keep the change limited to terminal activity label state and styling.

## Assumptions

- `working` should remain green.
- `idle` means terminal output has become quiet after activity and should use the yellow terminal-done color.
- No terminal lifecycle, process spawning, or service discovery behavior should change.

## Non-Goals

- Do not redesign project row layout.
- Do not change terminal tab state semantics.
- Do not change service running indicators.

## Done Criteria

- A project's left-row `working` label remains visible after selecting a different project while that project still has working terminal activity.
- The left-row `idle` label is yellow.
- Existing task/terminal labels continue to render without layout regressions.
- Verification commands pass or skipped checks are justified.
