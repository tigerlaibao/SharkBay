# Implementation Contract

## Scope

- Recolor service-related running indicators to blue:
  - project list running-service dot beside the project name
  - service start/stop pill running dot
- Replace the terminal tab output light with a command-agnostic working state:
  - output must continue for about 5 seconds before a tab enters green working state
  - a working tab with about 5 seconds of silence becomes yellow done/idle if it is not the currently open tab
  - a working tab with about 5 seconds of silence clears directly if it is currently open
  - clicking a yellow tab clears the yellow state
- Keep exited terminal tabs visually distinct.

## Assumptions

- "Current opened tab" means the active terminal tab in the visible terminal space.
- User input alone should not set a tab green; only PTY output contributes to working detection.
- Sustained output can be approximated by time from the first output burst to later output without a 5 second quiet gap.

## Non-Goals

- No command-specific parsing.
- No Codex-specific state detection.
- No persisted activity history.

## Done Criteria

- Service running indicators are blue across themes.
- A brief output/input burst does not make a terminal tab green.
- Sustained output for roughly 5 seconds makes the tab green.
- After roughly 5 seconds of no output, a green non-active tab turns yellow.
- After roughly 5 seconds of no output, a green active tab clears instead of turning yellow.
- Clicking a yellow tab clears it.
- Typecheck, build, and diff whitespace checks pass.
