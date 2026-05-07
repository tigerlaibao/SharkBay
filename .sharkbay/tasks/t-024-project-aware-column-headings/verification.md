# Verification

## Done Criteria Evidence

| Criterion | Evidence |
| --- | --- |
| Terminal column renders selected project name instead of literal `Terminal` | Source review: `src/renderer/App.tsx` line 1067 derives `terminalHeading` from `candidate?.name`; line 1073 renders it. |
| Managed project detail no longer renders project name/path header | Source review: `ProjectDetailPane` now starts with `detail-tab-cards` at `src/renderer/App.tsx` line 1631. |
| Not-setup detail no longer renders candidate name/path header | Source review: `NotSetupPane` now starts with the setup card at `src/renderer/App.tsx` line 1519. |
| Task detail page keeps task title/back control | Source review: task detail header was not modified. |

## Command Evidence

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
jq empty .agent/manifest.json .agent/state.json .agent/queue.json .agent/runner.json
exit 0
```

```text
npm run build
exit 0
vite v5.4.21 building for production...
✓ 36 modules transformed.
✓ built in 582ms
```

## Residual Risk

- Visual verification in a running Electron window was not performed. The change is limited to JSX header text/removal and passed typecheck/build.
