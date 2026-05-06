# t-017-minimum-default-columns

## Status

- Phase: done
- Gate: passed
- Owner: Codex
- Started: 2026-05-06
- Completed: 2026-05-06

## Goal

Initialize the project and detail columns at their minimum widths so the terminal column gets the remaining space by default.

## Acceptance Criteria

- First load uses minimum project column width.
- First load uses minimum detail column width.
- Terminal column remains flexible and fills the remaining right side.
- Existing old default-width cache does not force the previous wider initialization.

## Outcome

- Project and detail columns now initialize at their minimum widths.
- Terminal keeps the remaining flexible right-side width.
- Width persistence moved to v2 storage keys so old default-width cache is ignored.
