# t-047-hide-xterm-custom-scrollbar Code Review

## Findings

- blocker: 0
- major: 0
- minor: 0

## Review Notes

- Implementation matches the contract: CSS hides xterm's custom scrollbar/shadow elements in the terminal panel only.
- Terminal scrollback, xterm configuration, PTY behavior, and non-terminal scrolling were not changed.
- The diff is scoped to the user-reported visual defect plus harness task records.
