# Implementation

## Summary

- Changed the terminal column heading from the literal `Terminal` to the selected project candidate name, with `Terminal` retained as the empty-selection fallback.
- Removed the top-level project name/path `detail-header` from the managed project detail pane.
- Removed the top-level candidate name/path `detail-header` from the not-setup project pane.
- Left task detail headers intact because they provide task navigation and are not the redundant project name/path pair.

## Files Changed

- `src/renderer/App.tsx`

## Traceability

- User goal: middle column should show current project name.
- User goal: right column should no longer show project name and project path header.
- Contract: no terminal session, tab-title, scanner, or IPC behavior changed.

## Checks Run

```text
npm run typecheck
exit 0
> sharkbay@0.1.0 typecheck
> tsc -p tsconfig.renderer.json --noEmit && tsc -p tsconfig.node.json --noEmit
```

```text
git diff --check
exit 0
```

```text
npm run build
exit 0
vite v5.4.21 building for production...
✓ 36 modules transformed.
✓ built in 582ms
```

## Known Risks

- No automated DOM test exists for this exact header copy. The JSX diff is small and was reviewed directly.
