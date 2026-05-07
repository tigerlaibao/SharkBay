# Design

## Flow

1. User selects a not-setup project in the project list.
2. Right pane shows the project name/path and a quiet setup panel.
3. User clicks `Set up Ripple`.
4. The panel expands into a focused confirmation state that says SharkBay will add `.agent`, `docs`, and `tasks` harness files and will not overwrite existing files.
5. User confirms.
6. Main process validates configured-root authority, rejects symlink escapes, checks for existing harness files, copies the template, and returns written relative paths.
7. Renderer refreshes scan data and selects the newly managed project if possible.

## Backend

Extend `createHarnessRepo` to support an explicit existing-directory mode:

```ts
allowExistingDirectory?: boolean
```

Default remains safe for Settings-based new project creation: non-empty target directories are refused unless the new flag is true.

Safety rules:

- Resolve configured roots from runtime config for IPC calls.
- Resolve the target and parent through real paths.
- Reject an existing target symlink.
- Reject existing `.agent`.
- Copy only regular template files.
- Before each write, fail if the target file already exists.
- Return all written paths for result messaging and tests.

## Renderer

`NotSetupPane` owns a local confirmation state:

- Initial state: project identity plus one primary action, `Set up Ripple`.
- Confirming state: concise copy and `Cancel` / `Confirm setup`.
- Saving state: disable buttons.
- Success: toast and refresh.
- Failure: inline error text.

The setup panel should avoid teaching the harness internals in detail. It only needs enough information for consent and recovery.

## Files

| File | Change |
| --- | --- |
| `src/shared/types.ts` | Add the optional create input flag if not already present. |
| `src/renderer/types.ts` | Mirror the optional input flag. |
| `src/main/template-installer.ts` | Allow confirmed install into existing directories while preserving no-overwrite safety. |
| `src/renderer/App.tsx` | Wire setup from not-setup detail pane and refresh selection. |
| `src/styles/app.css` | Add compact confirmation/error styling only if existing styles are insufficient. |
| `tests/template-installer.test.ts` | Cover existing directory setup, collisions, existing harness, runtime roots, and symlink rejection. |
| `tests/renderer-workflow.test.ts` | Cover any extracted workflow helper for post-setup selection if added. |

## Acceptance

- Existing empty create flow still works.
- Existing non-empty directories are refused by default.
- Existing non-empty directories can be set up only when `allowExistingDirectory` is true.
- Existing files are never overwritten.
- Not-setup projects can initiate setup from the right pane.
- The app refreshes after setup and reports errors clearly.
