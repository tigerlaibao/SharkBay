# Design

## Layout

Replace the current single `detailColumnWidth` model with persisted `projectColumnWidth` and `detailColumnWidth` values.

Grid columns:

```text
project px | resizer | detail px | resizer | terminal minmax(min, 1fr)
```

The terminal column remains fluid so it naturally uses all remaining horizontal space. Minimum widths are enforced during drag calculations.

## Resize Behavior

- First separator sets project column width from the grid left edge to pointer X.
- Second separator sets detail column width from the detail column left edge to pointer X.
- Both calculations clamp against available grid width so terminal keeps its minimum usable width.
- Arrow keys adjust the relevant width in fixed increments.

## Risk

The main risk is stale inline grid styles overriding media queries. The inline style should include all responsive minimums through clamping instead of relying on CSS media column templates.
