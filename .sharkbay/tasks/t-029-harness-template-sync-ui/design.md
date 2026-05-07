# Design

## UI

- Add `harness stale` or `harness missing` pills to managed project rows.
- Add a detail-level `Harness files out of date/missing` panel above the detail tabs so it is visible regardless of the selected detail tab.
- Show the stale/missing version-owned file list as chips.
- Use a two-step action: `Sync` then `Confirm sync`.

## Behavior

- The detail panel calls `window.sharkBay.harness.updateTemplateFiles({ repoPath })`.
- On success, it refreshes workspace scan/detail state and shows a success toast.
- On failure, it shows an error toast.

## Safety

- The UI does not pass configured roots or template paths. The main process continues to load persisted configured roots and the runtime template root.
- The panel text states that state, tasks, docs, and queues are not changed.

## Files

- `src/renderer/App.tsx`
- `src/styles/app.css`
