# Implementation

## Changes

- Removed the right Tasks tab project status label strip and its local `StatusPill` component.
- Removed renderer label helpers for the deleted strip, including derived project task/runner/gate label presentation helpers.
- Removed the app-derived `ProjectTaskStatus` / `taskStatus` summary from shared and renderer project summary types.
- Removed `summarizeProjectTaskStatus` from harness scanning.
- Removed CSS classes that only supported the deleted project status labels.
- Kept task phase rendering in task rows and detail metadata.

## Protocol Audit

- Removed now: `taskStatus` was SharkBay-derived display state, not a required harness protocol field.
- Kept now: task `phase` remains the required workflow state and is still used throughout task queue/detail UI.
- Kept now: runner lifecycle metadata remains consumed by Settings `Needs action` and handoff/prompt surfaces.
- Kept now: user-action and gate metadata remain consumed by waiting-state detection and prompt copy.
- Kept now: harness template sync metadata remains consumed by the explicit sync panel.

## Files

- `src/renderer/App.tsx`
- `src/renderer/types.ts`
- `src/renderer/workflow.ts`
- `src/main/harness-reader.ts`
- `src/shared/types.ts`
- `src/styles/app.css`
- `tests/renderer-workflow.test.ts`
- `tests/harness-reader.test.ts`
