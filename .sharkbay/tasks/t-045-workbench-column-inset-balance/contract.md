# t-045-workbench-column-inset-balance Contract

## Scope

- Workbench layout CSS only.
- Restore top spacing for the terminal and right detail columns so their top and bottom window insets match.
- Preserve existing column resizing, terminal state preservation, right detail tab behavior, and left traffic-light avoidance.

## Non-Goals

- Redesign the full workbench.
- Change terminal backend behavior.
- Change Settings layout.
- Reintroduce a global titlebar spacer that pushes all content down unnecessarily.

## Done Criteria

- The workbench grid has equal top and bottom outer padding.
- The terminal and right detail columns no longer touch the window's top edge.
- The left project content remains offset below the hidden macOS titlebar controls.
- Typecheck, build, and diff checks pass, or any skipped check is recorded with reason.
