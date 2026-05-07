# Spec

## Scope

Add two horizontal column resize handles to the dashboard grid:

- Project list / task detail divider.
- Task detail / terminal divider.

Widths should be local UI state persisted in `localStorage`. The terminal column remains flexible and occupies the remaining right-side space.

## Non-goals

- No terminal split panes.
- No backend terminal changes.
- No global layout redesign beyond the dashboard columns.

## Acceptance

- Dragging either divider updates the grid immediately.
- Keyboard arrows on either separator adjust the adjacent column.
- The terminal xterm surface receives container resize events through the existing `ResizeObserver` path.
