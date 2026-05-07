# Implementation

## Summary

- Reworked the right detail tabs from four equal card-style blocks into a compact tab strip.
- Removed the filled active-state block and replaced it with a bottom active line.
- Matched the tab typography to the left sidebar section heading scale by using the same 12px uppercase, heavier-weight treatment.
- Removed the horizontal divider above the left sidebar `NOT SETUP` section while preserving its spacing.
- Preserved existing tab labels, ARIA attributes, keyboard behavior, and panel mounting behavior.

## Files Changed

- `src/styles/app.css`

## Traceability

- User goal: right sidebar top tabs are visually too heavy and should be simpler and more space-efficient.
- Contract: compact tab-strip visual treatment without behavior changes.

## Checks Run

```text
npm run typecheck
exit 0
> sharkbay@0.1.0 typecheck
> tsc -p tsconfig.renderer.json --noEmit && tsc -p tsconfig.node.json --noEmit
```

```text
npm run build
exit 0
vite v5.4.21 building for production...
✓ 36 modules transformed.
✓ built in 482ms
```

```text
git diff --check
exit 0
```

## Known Risks

- No automated screenshot assertion exists for this exact visual refinement.
