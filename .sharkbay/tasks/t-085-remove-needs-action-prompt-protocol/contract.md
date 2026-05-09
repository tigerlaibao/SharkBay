# Implementation Contract

## Scope

- Remove Settings Needs action counts and project list.
- Remove Tasks tab handoff / prompt panel.
- Remove prompt generation IPC/preload API, main prompt generator, and related tests.
- Remove renderer workflow helpers for Needs action and handoff.
- Remove `gateStatus`, `requiresUserAction`, and `userActionReason` parsing/types when only used by the removed surfaces.
- Remove runner task-registration diagnostics when only used to produce Needs action prompts.
- Keep task phases and queue/task detail rendering.

## Assumptions

- `blocked` remains a task phase value, but it should not create a separate Needs action surface.
- Runner files can remain recognized by uninstall/migration cleanup, but app project summaries no longer parse or expose runner lifecycle metadata.
- Harness template sync and legacy cleanup panels are not part of this removal.

## Non-Goals

- Do not rewrite old historical task documents.
- Do not remove `nextAction` fields from existing harness state files.
- Do not remove task phases.

## Done Criteria

- UI no longer shows Needs action or Agent Handoff/prompt controls.
- Prompt-generation API/types/tests are removed or no longer referenced.
- Gate/user-action fields are no longer exposed in app project/task contracts.
- Task phases still render in queue/detail UI.
- Verification commands pass.
