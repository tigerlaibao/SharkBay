# Task Status

## Metadata

| Field | Value |
| --- | --- |
| Task ID | t-035-native-titlebar-removal |
| Title | Hide native macOS title bar |
| Priority | 1 |
| Phase | done |
| Owner Role | Controller |
| Depends On | none |
| Created | 2026-05-06T23:44:25+08:00 |
| Updated | 2026-05-06T23:44:25+08:00 |

## Goal

Remove the visible standard macOS Electron title bar so SharkBay's first row of UI starts directly below the traffic-light window controls.

## Scope

In scope:

- Configure the main Electron `BrowserWindow` to hide the native title bar on macOS while preserving standard window controls.
- Keep existing window sizing, preload, menu, and dev/prod loading behavior unchanged.
- Verify the Electron/TypeScript build still accepts the window configuration.

Out of scope:

- Custom draggable chrome, toolbar redesign, or moving app UI around the traffic-light controls.
- Changing Settings/menu behavior.
- Packaging or release work.

## Current Gate

| Gate | Status | Notes |
| --- | --- | --- |
| Dependencies | passed | No dependencies. |
| Spec | passed | Scope and assumptions recorded. |
| Design review | passed | blocker=0, major=0. |
| Contract | passed | BrowserWindow-only implementation contract approved. |
| Code review | passed | blocker=0, major=0. |
| Verification | passed | `npm run typecheck`, `npm run build`, and `git diff --check` passed. |
| Docs update | passed | `docs/task.md` updated. |

## Next Action

Idle.

## Open Questions

| Question | Blocks Phase | Owner |
| --- | --- | --- |
| none | none | none |

## History

| Date | Phase | Summary |
| --- | --- | --- |
| 2026-05-06T23:44:25+08:00 | spec | Opened task to hide SharkBay's native macOS title bar. |
| 2026-05-06T23:44:25+08:00 | coding | Spec, design review, and contract passed; coding opened. |
| 2026-05-06T23:47:00+08:00 | code_review | Implemented platform-specific hidden-inset BrowserWindow title bar behavior. |
| 2026-05-06T23:49:00+08:00 | verification | Code review passed; required checks passed. |
| 2026-05-06T23:52:00+08:00 | done | Verification passed and the task was marked done. |
| 2026-05-06T23:55:00+08:00 | done | Product code checkpoint committed as `2cd09cd`. |
