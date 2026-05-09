# Task Status

- Task ID: `t-085-remove-needs-action-prompt-protocol`
- Title: Remove Needs Action and prompt protocol
- Phase: done
- Status: done
- Priority: 1
- Depends on: none
- Started: 2026-05-09T16:38:14+08:00

## Request

Remove Needs action and handoff/prompt surfaces. Remove harness protocol parsing/state that only existed to serve those surfaces. Keep task phases.

## Progress

- Registered active task.
- Auditing prompt, Needs action, gate/user-action, and runner-registration consumers.
- Removed Needs action and handoff/prompt UI surfaces.
- Removed prompt generation IPC/preload API, main prompt generator, and prompt tests.
- Removed gate/user-action and runner summary parsing from app project contracts.
- Removed runner lifecycle requirements from the active harness protocol and harness install template protocol.
- Verification passed.

## Verification Plan

- `npm run typecheck`
- focused affected tests
- `npm run build`
- `git diff --check`

## Completed

2026-05-09T16:48:29+08:00
