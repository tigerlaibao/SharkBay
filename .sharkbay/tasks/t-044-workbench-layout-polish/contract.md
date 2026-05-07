# t-044-workbench-layout-polish Contract

## Scope

- Workbench layout and CSS only.
- Preserve existing column resizing and terminal state behavior.
- Keep left project content below the macOS traffic-light controls.
- Increase only the right detail tab strip/card height, not all tab controls globally.

## Non-Goals

- Redesign the whole workbench.
- Change terminal backend behavior.
- Change Settings layout unless required by shared shell constraints.

## Done Criteria

- The global top padding no longer consumes vertical space for the terminal and right detail columns.
- The left project column keeps a drag region and content offset compatible with hidden macOS titlebar controls.
- The active xterm surface has enough bottom padding so the last terminal row is fully visible.
- `.detail-tab-card` height is approximately 50% taller than before.
- Typecheck, build, and diff checks pass.

