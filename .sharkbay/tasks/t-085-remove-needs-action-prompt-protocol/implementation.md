# Implementation

## Changes

- Removed Settings `Needs action` counts and project list.
- Removed Tasks tab handoff/prompt panel and supporting renderer state.
- Deleted prompt generation from the main process, preload bridge, IPC services, and tests.
- Removed renderer workflow helpers for user-action, handoff, gate display, and ready-backlog prompt selection.
- Removed `gateStatus`, `requiresUserAction`, and `userActionReason` from task/project contracts and harness-reader normalization.
- Removed app parsing/exposure of runner lifecycle and runner task-registration diagnostics.
- Removed runner lifecycle requirements from `.sharkbay/protocol.md` and `templates/harness/.sharkbay/protocol.md`.
- Updated harness template `AGENTS.md` to stop instructing new projects to publish runner state.
- Kept task phases and queue/detail phase rendering.

## Kept

- Task `phase` remains the primary workflow state.
- `runner.json` remains a recognized file for uninstall/migration cleanup, so existing projects can still clean up old ignored runner files.
- Historical task documents were left as history rather than rewritten.
