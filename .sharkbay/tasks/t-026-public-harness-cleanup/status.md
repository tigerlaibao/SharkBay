# Clean public repository harness state and audit tracked content

- Task ID: `t-026-public-harness-cleanup`
- Priority: 1
- Phase: coding
- Status: active
- Depends on: none
- Opened: 2026-05-06T21:04:00+08:00
- Owner: Codex

## User Goal

Clean SharkBay's public Git-tracked tree so fork users do not inherit SharkBay's own local harness run history, while preserving the bundled harness templates that SharkBay installs into other projects. Include a serious content audit before publishing the cleanup.

## Scope

- Audit currently tracked local harness/process files for sensitive or private material.
- Keep `templates/harness/**` tracked as product template source.
- Remove SharkBay's own local `.agent/**`, root `tasks/**`, and process docs from public Git tracking.
- Add root-anchored ignore rules so future local harness state stays untracked without hiding template files.
- Update public docs and agent instructions so fresh clones do not require missing local harness files.

## Non-Goals

- Do not rewrite Git history in this task.
- Do not remove or alter `templates/harness/**`.
- Do not publish until cleanup and audit evidence are reviewed.

## Assumptions

- The user selected the non-history-rewrite cleanup path because the concern is public noise and process visibility, not confirmed leaked secrets.
- Local harness files may remain in the working tree for SharkBay dogfooding, but they should not remain tracked in the public source tree.

## Verification Plan

- Run tracked-file inventory checks for `.agent`, `tasks`, and `templates/harness`.
- Run content-audit searches for common secret/private indicators across currently tracked local harness/process files.
- Confirm `templates/harness/**` remains tracked after cleanup.
- Run `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check`.
- Inspect final `git status` and staged/working diff summary before final report.

## Outcome

- 2026-05-06T21:09:30+08:00: Completed cleanup and verification. Created commit `06f89a2 Stop tracking local harness state`. Push is intentionally pending user confirmation because publishing to origin is an approval stop.

## Verification Summary

- Content audit found no likely secret/token values. It found local project paths and process evidence in historical task files, supporting the forward cleanup.
- Root local harness/process paths are no longer tracked.
- `templates/harness/**` remains tracked.
- `git diff --check`, `npm run typecheck`, `npm test`, and `npm run build` passed.

## Final State

- Phase: done
- Status: done locally
- Publish: waiting for user confirmation before push
