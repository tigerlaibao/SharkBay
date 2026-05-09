# Implementation Contract

## Scope

- Move project status pills currently rendered in left project rows into the selected project's right-column Tasks tab top.
- Keep dirty/git-unknown worktree tags in the left project rows.
- Add project-level terminal activity labels in the left project rows:
  - green `working` when any terminal tab for the project is working
  - yellow `idle` when no tab is working and at least one terminal tab has completed/quieted
  - no simultaneous `working` and `idle`
- Preserve service running dots as blue indicators.

## Assumptions

- Project terminal state is aggregated from terminal tab activity state already tracked in the renderer.
- `idle` in the left project row corresponds to a terminal tab's yellow done/quiet state.
- The right-column status row belongs at the top of the Tasks tab content.

## Non-Goals

- No new terminal process inspection.
- No command-specific parsing.
- No changes to dirty file detection.

## Done Criteria

- Left project rows no longer show phase, needs-action, runner, gate, or harness status pills.
- Left project rows still show dirty/git-unknown worktree tags.
- Left project rows show at most one terminal activity label, with `working` prioritized over `idle`.
- Right Tasks tab top shows the moved project status pills in one row.
- Typecheck, build, and diff whitespace checks pass.
