# Design Review

## Scope Reviewed

- `tasks/t-011-runner-lifecycle-heartbeat/spec.md`
- `tasks/t-011-runner-lifecycle-heartbeat/design.md`
- Current reader/UI paths in `src/main/harness-reader.ts`, `src/shared/types.ts`, `src/renderer/types.ts`, and `src/renderer/workflow.ts`

## Findings

| Severity | Finding | Recommendation |
| --- | --- | --- |
| Blocker | None. |  |
| Major | None. |  |
| Minor | The design intentionally defers multi-runner arbitration. This is acceptable for the first slice but should be named in the contract as out of scope. | Keep first implementation to one latest runner record. |
| Minor | `idle` and missing/invalid runner metadata are close but not identical. | Treat missing metadata as `unknown`, explicit `idle` as `idle`, and keep both out of urgent `Needs Action`. |

## Gate Decision

Pass.

The design directly addresses the user-identified model bug: harness phase and physical agent execution lifecycle are separate axes. The `.agent/runner.json` choice keeps heartbeat churn out of durable task state, and the proposed UI rules avoid using `design_review`, `coding`, or other phases as a proxy for human intervention.
