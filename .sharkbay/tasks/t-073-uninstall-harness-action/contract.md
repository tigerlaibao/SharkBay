# T-073 Contract: Add uninstall harness action

## Scope

Implement a user-confirmed "Uninstall Harness" action from the left project card context menu.

The action must:

- Be reachable by right-clicking a left-column project card.
- Require user confirmation before any filesystem mutation.
- Remove SharkBay/Ripple harness files from the selected project workspace.
- Remove only the harness-related `.gitignore` lines, preserving unrelated `.gitignore` content.
- Refresh project scan/detail state after completion.

## Assumptions

- "Harness files" means SharkBay-owned install artifacts from the current contained layout and legacy compatibility layout: root `AGENTS.md`, contained `.sharkbay/`, legacy `.agent/`, and legacy root `tasks/`/`docs/` files only when they are recognized harness artifacts.
- This is a product feature; it must not run the uninstall against any real project during implementation.
- Confirmation in the renderer is sufficient for the UI gate; backend still enforces configured-root containment and safe path checks.

## Non-Goals

- No bulk uninstall.
- No deleting user source files outside recognized harness artifacts.
- No deleting arbitrary `.gitignore` patterns.
- No changing scan root configuration.
- No automatic git commits in target projects.

## Safety Requirements

- Backend must resolve the target project through configured roots; renderer-provided paths are not authority.
- Backend must reject symlink escapes and refuse suspicious legacy task/doc paths.
- `.gitignore` edits must be line-based and remove only recognized harness ignore entries or an empty SharkBay/Ripple marker block.
- Missing files should be tolerated; unrelated files must be preserved.

## Done Criteria

- Context menu UI exists on project rows and shows a destructive uninstall action only for managed projects.
- User confirmation is required before invoking uninstall.
- Backend IPC removes recognized harness files and returns a result summary.
- `.gitignore` cleanup preserves unrelated lines and removes only harness-related entries.
- Tests cover contained uninstall, `.gitignore` cleanup preservation, and safety refusal for paths outside configured roots or unsafe legacy content.
- Verification records focused tests, typecheck, build, full tests where practical, and `git diff --check`.
