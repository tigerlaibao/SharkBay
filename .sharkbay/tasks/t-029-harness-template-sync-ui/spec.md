# Spec

## Scope

The harness template sync service from `t-028` is not visible to users after app restart. SharkBay must surface stale or missing harness control files in the UI and provide an explicit sync action.

## Acceptance Criteria

- Managed project rows show a visible stale/missing harness status.
- The selected project's detail panel shows the affected file list.
- Sync requires an explicit confirmation before overwriting version-owned files.
- Sync refreshes scan/detail state after success.
- Project-owned files remain outside the UI sync contract.

## Non-Goals

- No automatic background mutation.
- No bulk "sync all projects" action.
- No merge UI for local edits to version-owned files.

## Blocking Questions

None.
