# t-055-classic-t050-palette Implementation

## Changes

- Added full ANSI and bright ANSI entries to the Classic xterm theme.
- Kept the Classic xterm background, foreground, cursor, and selection values at the T050 baseline.

## Reasoning

T050 only supplied xterm's four core theme values and let xterm use its defaults for ANSI colors. After Day/Night themes introduced custom ANSI values, switching an existing terminal back to Classic could leave non-classic ANSI colors in place. Classic now explicitly supplies the default xterm ANSI palette so the terminal resets fully.
