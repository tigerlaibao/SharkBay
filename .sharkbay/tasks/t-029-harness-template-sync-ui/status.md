# t-029-harness-template-sync-ui

## Status

- Title: Surface harness template drift and explicit sync in the UI
- Phase: done
- Status: done
- Priority: 1
- Depends on: t-028-harness-template-sync
- Created: 2026-05-06T22:05:00+08:00
- Updated: 2026-05-06T22:14:00+08:00
- Completed: 2026-05-06

## User Goal

After restarting SharkBay, stale managed project harness files should be visible in the app. The user should not need to know that sync status only exists in scan data or hidden IPC calls.

## Assumptions

- Sync must remain explicit because it overwrites version-owned local edits.
- The UI should surface stale/missing state without touching project-owned task/state/doc files.
- This task depends on `t-028-harness-template-sync`, which is done.

## Done Criteria

- Project rows visibly indicate stale or missing harness template files.
- Project detail exposes the stale/missing file list and a clear explicit sync action.
- Successful sync refreshes the project scan/detail state.
- Required checks pass.

## Notes

- Opened from user report that restarting SharkBay showed no prompt or visible effect.
- Implementation, review, and verification passed.
- Checkpoint commit: `ba2d551 Surface harness template sync status`.
