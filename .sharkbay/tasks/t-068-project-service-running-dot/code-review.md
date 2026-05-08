# Code Review

## Findings

- blocker: 0
- major: 0
- minor: 0

## Review Notes

- Scope is limited to renderer state propagation and project row styling.
- Service runtime behavior, discovery, and terminal lifecycle code paths are unchanged.
- The indicator is driven from running service-bound terminal tabs, so it disappears when the tab is stopped or exits.

## Gate

- Code review gate passed.
