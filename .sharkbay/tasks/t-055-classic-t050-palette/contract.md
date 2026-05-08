# t-055-classic-t050-palette Contract

## Scope

- Make Classic terminal xterm theme reset all relevant palette entries to stable T050-compatible values.
- Keep Classic as light workspace plus dark terminal column.
- Avoid changing Day/Night semantics.

## Non-Goals

- No new theme modes.
- No icon changes.
- No layout changes.

## Done Criteria

- Classic xterm theme no longer inherits Day/Night ANSI colors after switching.
- Classic terminal chrome remains scoped to the T050 dark terminal baseline.
- Required verification passes.
