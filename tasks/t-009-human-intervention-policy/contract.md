# Implementation Contract

## Goal

Implement a clear human-intervention policy and wire the sidebar to it.

## Files

| File | Responsibility |
| --- | --- |
| `src/renderer/workflow.ts` | Source of truth for whether a project needs user action and why. |
| `src/renderer/App.tsx` | Use workflow policy for `Needs Action`. |
| `tests/renderer-workflow.test.ts` | Test done, dirty, auto, review, verification, and blocked cases. |
| `.agent/protocol.md` | Document when agents keep going and when they stop. |
| Task/state/queue docs | Record task lifecycle and verification. |

## Required Behavior

- Done projects do not appear in `Needs Action`.
- Dirty worktree alone does not appear in `Needs Action`.
- Active `blocked` phases appear.
- Explicit approval/user-action states appear.
- Explicit blocked gate appears.
- Active `coding`, review, verification, and other auto phases stay quiet unless explicit user action is recorded.

## Required Checks

- `npm run typecheck`
- `npm test -- tests/renderer-workflow.test.ts`
- `npm test`
- `npm run build`
- `git diff --check`

## Stop Conditions

- Policy requires a new task schema before it can work.
- UI cannot distinguish dirty from human action.
- A phase rule is ambiguous enough that it needs user product input.
