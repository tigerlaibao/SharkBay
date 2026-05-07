# Task Status

## Metadata

| Field | Value |
| --- | --- |
| Task ID | t-036-window-drag-region |
| Title | Restore draggable window region |
| Priority | 1 |
| Phase | done |
| Owner Role | Controller |
| Depends On | none |
| Created | 2026-05-06T23:57:05+08:00 |
| Updated | 2026-05-07T00:06:00+08:00 |

## Goal

Restore a macOS-like window drag affordance after hiding SharkBay's native Electron title bar, and move the left project list content below the traffic-light controls.

## Scope

In scope:

- Add a top renderer drag region that works with the hidden macOS title bar.
- Keep interactive controls, project rows, terminal tabs, detail tabs, and column resize handles clickable.
- Add enough top inset to the left project panel so content no longer stacks under the red/yellow/green controls.
- Verify TypeScript/build/CSS checks still pass.

Out of scope:

- Reintroducing the visible native title bar.
- Replacing native window controls.
- Broad layout redesign or toolbar work.

## Current Gate

| Gate | Status | Notes |
| --- | --- | --- |
| Dependencies | passed | No dependencies. |
| Spec | passed | Small follow-up to t-035. |
| Design review | passed | blocker=0, major=0; use Electron drag region CSS and avoid controls. |
| Contract | passed | Renderer/CSS-only implementation contract approved. |
| Code review | passed | blocker=0, major=0. |
| Verification | passed | `git diff --check`, `npm run typecheck`, `npm run build`, and Electron visual check passed. |
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
| 2026-05-06T23:57:05+08:00 | coding | Opened task after user confirmed custom drag strip approach and requested left content inset. |
| 2026-05-07T00:02:00+08:00 | code_review | Implemented renderer drag strip and workspace top inset. |
| 2026-05-07T00:04:00+08:00 | verification | Code review passed; required checks and Electron visual check passed. |
| 2026-05-07T00:06:00+08:00 | done | Verification passed and the task was marked done. |
| 2026-05-07T00:07:00+08:00 | done | Product code checkpoint committed as `166ecec`. |
