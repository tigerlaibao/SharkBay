# Implementation Contract

## Scope

Implement the first runner lifecycle slice:

- Add a typed runner lifecycle summary to shared and renderer project data.
- Read optional `.agent/runner.json` from managed projects.
- Validate runner JSON without failing project loading.
- Derive `stale` from an old or missing heartbeat when the runner claims `running`.
- Use runner lifecycle, not harness task phase, to decide whether a project belongs in `Needs Action`.
- Keep idle or unknown runner state out of urgent `Needs Action` while still allowing an `Agent Handoff` panel for active tasks that are not being run.

## Files Allowed

- `src/shared/types.ts`
- `src/renderer/types.ts`
- `src/shared/schema.ts`
- `src/main/harness-reader.ts`
- `src/renderer/workflow.ts`
- `src/renderer/App.tsx`
- `tests/harness-reader.test.ts`
- `tests/renderer-workflow.test.ts`
- `tests/helpers.ts`
- `tasks/t-011-runner-lifecycle-heartbeat/*`
- `.agent/queue.json`
- `.agent/queue.md`
- `.agent/state.json`
- `.agent/state.md`
- `docs/task.md`

## Files Out Of Scope

- IDE integrations.
- Direct background agent execution.
- Process-table or window-title probing.
- Multi-runner arbitration.
- Existing task archives unrelated to `t-011`.
- Broad visual redesign beyond the runner/action surfaces needed for this task.

## Behavioral Requirements

Runner file:

- Missing `.agent/runner.json` yields a non-error `unknown` runner state.
- Invalid `.agent/runner.json` yields `unknown` and records a project diagnostic.
- Valid `status=idle`, `blocked`, or `waiting_for_human` is surfaced directly.
- Valid `status=running` stays `running` only when `heartbeatAt` is valid and younger than five minutes.
- `status=running` with missing, invalid, or old `heartbeatAt` becomes derived `stale`.

Human intervention:

- `waiting_for_human`, `blocked`, and `stale` count as `Needs Action`.
- Fresh `running` does not count as `Needs Action`.
- `idle` or `unknown` with an active unfinished task does not count as `Needs Action`.
- `idle` or `unknown` with an active unfinished task may show `Agent Handoff` in the detail panel.
- Done tasks never show runner handoff solely because a stale runner file exists.

Compatibility:

- Existing projects without `.agent/runner.json` must keep loading.
- Existing tests for harness reading and renderer workflow should continue passing.
- Renderer and main-process type definitions must stay in sync.

## Verification

Required checks:

- `npm run typecheck`
- `npm run lint`
- focused runner/handoff tests
- `npm test`
- `npm run build`
- `git diff --check`
- `npm run dev`

`npm run dev` may be recorded as blocked only if the existing dev server already occupies the configured port and the existing server responds successfully.

## Stop Conditions

- Stop before destructive changes, publishing, deployment, secrets, or writes outside the approved workspace.
- Stop if implementing this slice requires an IDE extension or direct integration with another app.
- Stop if the runner lifecycle model needs user policy clarification beyond the states already approved in `design.md`.

## Controller Gate

The contract is accepted for coding because:

- Dependency `t-010-agent-onboarding-instructions` is done.
- The design review found no blockers or major findings.
- The first slice is local, additive, and backward compatible.
