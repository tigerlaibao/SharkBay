# Implementation

## Changed Files

- `src/renderer/App.tsx`
- `src/styles/app.css`

## Notes

- Replaced the immediate terminal output activity boolean with a per-tab `idle` / `working` / `done` state.
- A tab starts an output burst when PTY output arrives.
- The tab only enters green `working` after output continues across the 5 second threshold.
- A quiet timer fires after 5 seconds without output:
  - green non-current tabs become yellow `done`
  - green current tabs clear directly to `idle`
  - short bursts clear to `idle`
- Clicking a yellow tab clears it.
- Exited tabs still render with the exited gray state.
- Recolored service running dots to blue in the project list and service pills across themes.

## Verification

See `verification.md`.
