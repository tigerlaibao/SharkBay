# Implementation Contract

## Scope

- Track recent PTY output per terminal tab in the renderer.
- Turn the terminal tab indicator on when output arrives for that tab.
- Turn the indicator off after a short quiet timeout.
- Keep exited terminal tabs visually distinct from quiet running tabs.

## Assumptions

- The first slice should be command-agnostic and should not parse Codex or any other TUI state.
- "Working" means output activity for the indicator, not a guaranteed semantic process state.

## Non-Goals

- No command-specific parsing.
- No main-process terminal screen-buffer model.
- No persisted activity history.

## Done Criteria

- Any terminal tab receiving output shows an active green indicator.
- A running tab with no recent output shows an inactive indicator.
- An exited tab still shows the exited/gray indicator.
- Typecheck, build, and diff whitespace checks pass.
