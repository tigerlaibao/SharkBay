# T-073 Code Review

## Findings

- blocker: 0
- major: 0
- minor: 0

## Review Notes

- The destructive action is gated in the UI with a user confirmation prompt before IPC invocation.
- The IPC default service does not trust renderer-provided roots; it reloads configured roots from SharkBay app config and passes those to the uninstall backend.
- The backend uses `resolveRepoPath` and `isPathInside`, rejects symlinked harness targets and nested symlinks before recursive deletion, and blocks symlinked/non-file `.gitignore`.
- `.gitignore` cleanup removes only exact known harness ignore entries and adjacent SharkBay/Ripple/harness marker comment spacing, preserving unrelated lines.
- The UI action is only passed to the Managed project table, so Not setup projects do not expose the uninstall menu.

## Gate

Code review passed.
