# T-073 Implementation

## Summary

- Added a main-process harness uninstall service in `src/main/harness-uninstall.ts`.
- Exposed the service through IPC/preload and shared renderer types as `window.sharkBay.harness.uninstall`.
- Added a right-click context menu on Managed project rows with a destructive `Uninstall Harness` action guarded by `window.confirm`.
- Refresh now rescans projects after uninstall and clears stale detail state if the selected project no longer exists.

## Files Changed

- `src/main/harness-uninstall.ts`: removes contained `.sharkbay/`, legacy `.agent/`, recognized `AGENTS.md`, legacy root docs/task artifacts, and exact harness `.gitignore` entries after configured-root path validation and symlink preflight.
- `electron/ipc.ts` and `electron/preload.mts`: added the `harness:uninstall` channel and bridge method.
- `src/shared/types.ts` and `src/renderer/types.ts`: added uninstall input/result types.
- `src/renderer/App.tsx`: added the Managed-row context menu, confirmation flow, result toast, and refresh handling.
- `src/styles/app.css`: styled the context menu in the default and Night themes.
- `tests/harness-uninstall.test.ts`: added focused coverage for contained uninstall, legacy uninstall preservation, unsafe path rejection, symlink blocking, and `.gitignore` cleanup.

## Notes

- The renderer sends only the selected project path; the main-process default service reloads configured roots from app config before calling the backend.
- No uninstall was run against a real project during implementation.
