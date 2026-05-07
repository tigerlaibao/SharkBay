# t-045-workbench-column-inset-balance Implementation

## Change

- Added `--workbench-edge-inset` for the workbench edge spacing value.
- Kept `.workspace` bottom and horizontal padding on that shared inset.
- Added matching top margin to the terminal panel, right detail panel, and column resizers.
- Reduced those columns' heights by the same inset so their bottom edge remains aligned with the existing bottom padding.
- Left project column top padding and drag strip behavior are unchanged, preserving hidden-titlebar/traffic-light clearance.

## Files

- `src/styles/app.css`
