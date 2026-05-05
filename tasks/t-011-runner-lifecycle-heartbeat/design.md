# Design

## Summary

Introduce a runner lifecycle layer that is separate from harness task phase. Agents update a cooperative runner lease file; SharkBay reads it, derives a freshness-aware runner display state, and uses that state when deciding whether a project needs human attention.

## Core Model

Task phase remains unchanged:

```text
intake -> spec -> design -> design_review -> contract -> coding -> code_review -> verification -> docs_update -> done
```

Runner lifecycle is separate:

```text
unknown | idle | running | stale | blocked | waiting_for_human
```

`phase=design_review` means the task is in a review phase.

`runner.status=running` means an agent is physically working.

`runner.status=waiting_for_human` means the user must act.

These states must not be inferred from each other.

## Data File

Use `.agent/runner.json` for the first implementation.

Reasons:

- Runner heartbeat is higher-frequency than task state and should not churn `.agent/state.json`.
- `.agent/state.json` remains the durable project/task mirror.
- Future IDE extensions and direct SharkBay runners can write the same file.
- Missing `.agent/runner.json` can cleanly mean `unknown` or `idle`.

Shape:

```json
{
  "schemaVersion": 1,
  "status": "running",
  "sessionId": "codex-2026-05-05T21-30-00-local",
  "owner": "codex",
  "taskId": "t-011-runner-lifecycle-heartbeat",
  "phase": "coding",
  "startedAt": "2026-05-05T21:30:00+08:00",
  "heartbeatAt": "2026-05-05T21:32:00+08:00",
  "message": "Implementing runner lifecycle reader",
  "reason": null
}
```

Fields:

| Field | Required | Notes |
| --- | --- | --- |
| `schemaVersion` | yes | Start with `1`. |
| `status` | yes | `idle`, `running`, `blocked`, or `waiting_for_human`. SharkBay derives `stale`. |
| `sessionId` | no | Unique runner/session id. Required for `running`. |
| `owner` | no | Agent or tool name, such as `codex`, `cursor`, or `sharkbay`. |
| `taskId` | no | Claimed task. |
| `phase` | no | Snapshot only; task status remains source of truth. |
| `startedAt` | no | ISO timestamp. |
| `heartbeatAt` | no | ISO timestamp used for staleness. |
| `message` | no | Low-prominence status text. |
| `reason` | no | Human-facing explanation for blocked/waiting states. |

## Freshness

SharkBay derives `stale` when:

- stored status is `running`;
- `heartbeatAt` is missing or invalid; or
- `heartbeatAt` is older than five minutes.

Five minutes is the initial fixed threshold. It should later become configurable only if real usage proves the default wrong.

## Agent Write Protocol

When an agent starts work:

1. Read `AGENTS.md`, `.agent/protocol.md`, queue/state mirrors, and current task status.
2. Write `.agent/runner.json` with `status=running`, a `sessionId`, `owner`, `taskId`, `phase`, `startedAt`, and `heartbeatAt`.
3. Continue work autonomously under the harness protocol.

During work:

- Refresh `heartbeatAt` at meaningful intervals.
- Update `phase` and `message` when transitioning phases.
- Keep task status and queue/state mirrors synchronized separately from runner heartbeat.

When work stops:

- On normal completion with no active task, write `status=idle`.
- On a human decision, write `status=waiting_for_human` with `reason`.
- On an external blocker, write `status=blocked` with `reason`.
- If the process dies, SharkBay derives `stale` from the old heartbeat.

## SharkBay Read Path

Add runner reading to the same place SharkBay reads harness project detail:

- Read `.agent/runner.json` using existing configured-root path safety.
- Validate into a typed `RunnerSummary`.
- Add `runner` to `ProjectSummary` and `ProjectDetail`.
- Include runner parse errors in project diagnostics.
- Do not fail project loading if runner metadata is missing or invalid.

## UI Semantics

`Needs Action` should mean urgent human attention, not ordinary progress.

Rules:

| State | UI |
| --- | --- |
| `running` fresh | No `Needs Action`; show low-prominence running state in project detail/list. |
| `stale` | Show in `Needs Action` as stale runner; include last heartbeat if available. |
| `waiting_for_human` | Show in `Needs Action`; show `reason`; handoff prompt may be useful. |
| `blocked` | Show in `Needs Action`; show blocker reason. |
| `idle/unknown + active task` | Do not label as human decision; show a lower-urgency `Agent Handoff` in detail. |
| `done` | No handoff, even if runner file is stale. |

The current sidebar can continue using `Needs Action` for `stale`, `blocked`, and `waiting_for_human`. `idle + active task` should stay out of the urgent sidebar until there is a separate `Ready to Run` surface.

## Implementation Slices

Slice 1:

- Add shared/renderer runner types.
- Add `.agent/runner.json` reader and validator.
- Add runner to project summary/detail.
- Change `projectNeedsUserAction` to use runner state, not `activeTask.status`.
- Update focused tests.

Slice 2:

- Add compact runner display in project rows/detail.
- Refine `Agent Handoff` visibility for idle/unknown active tasks.
- Add protocol docs for runner lease and heartbeat.

Slice 3:

- Add writer helpers for future SharkBay-owned runners or IDE integration.
- Add stale cleanup and conflict semantics if real usage needs them.

## Risks

- Agents must cooperate. Without a runner file, SharkBay still cannot know another IDE's private state.
- Heartbeat writes can create file churn if too frequent; keep the protocol interval meaningful rather than constant sub-second updates.
- Multiple agents may claim the same task. First slice should display the latest runner record only; multi-runner arbitration is a future task.

## Verification Plan

- Unit tests for missing, valid, invalid, stale, blocked, waiting, and running runner files.
- Renderer workflow tests for `Needs Action` decisions.
- Typecheck and build.
- Existing project scan/read tests must continue passing with missing runner metadata.
