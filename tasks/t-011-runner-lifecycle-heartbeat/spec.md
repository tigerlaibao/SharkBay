# Spec

## User Goal

SharkBay should not guess whether a project needs human attention from the task phase alone. It should know whether an agent is physically running, stale, idle, blocked, or waiting for the user through an explicit runner lifecycle signal.

## Problem

The harness phase answers: "where is this task in the engineering process?"

The runner lifecycle answers: "is anyone actually executing this task right now?"

SharkBay currently mixes those concerns. A task in `design_review` can be actively running in another IDE session, but SharkBay may still show `Agent Handoff` because it has no separate runner heartbeat. Conversely, a task can be idle in `coding`, and that should be shown as a runnable handoff rather than a product decision.

An independent local app cannot reliably infer another IDE agent's private execution state. The only robust local-first path is a cooperative lease and heartbeat file that every harness-aware agent updates.

## Requirements

| Priority | Requirement | Acceptance Criteria |
| --- | --- | --- |
| P0 | Separate phase from runner lifecycle | `phase` remains the engineering lifecycle. Runner state is represented by a separate data model with its own status, session id, task id, phase snapshot, timestamps, and message/reason fields. |
| P0 | Cooperative heartbeat | A harness-aware agent can mark itself running, refresh a heartbeat, and release or transition the runner state without relying on IDE-private APIs. |
| P0 | Staleness detection | SharkBay treats `running` with an old heartbeat as `stale` for display and action decisions. |
| P0 | Human intervention accuracy | `Needs Action` is reserved for `waiting_for_human`, `blocked`, `stale`, and explicit approval/action reasons, not merely for normal phases. |
| P0 | Handoff clarity | `idle + active task` is shown as a handoff or ready-to-run state, distinct from a human decision or blocker. |
| P0 | Local-first source of truth | Runner lifecycle is read from project files under `.agent/` and remains usable without network access or IDE plugins. |
| P1 | Backward compatibility | Projects without runner metadata still load; SharkBay can show an unknown/idle runner state without parse failure. |
| P1 | Low-write safety | Runner heartbeat writes must be narrow, atomic, and not disturb task phase artifacts or queue mirrors. |
| P1 | Future IDE integration | The design leaves room for a later IDE extension or direct Codex integration to update the same runner data. |

## Proposed Runner States

| State | Meaning | Needs Action? |
| --- | --- | --- |
| `idle` | No runner has claimed the active task. | No, but the project may be ready for handoff. |
| `running` | A runner has a fresh lease and heartbeat. | No. |
| `stale` | Last known runner heartbeat exceeded the freshness threshold. | Yes, because the work may be abandoned. |
| `blocked` | Runner reports a blocker that prevents progress. | Yes. |
| `waiting_for_human` | Runner explicitly needs a human decision, approval, input, or manual action. | Yes. |
| `unknown` | Runner metadata is missing or invalid. | No by itself; combine with active task state for display. |

## Proposed Data Shape

The first design should decide exact placement, but the lifecycle record should contain at least:

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

## Non-Goals

- Detecting arbitrary IDE agent state without a cooperative file protocol.
- Polling private IDE internals.
- Treating process existence as authoritative task execution.
- Conflating review phases with human review.
- Requiring network services or cloud coordination.

## Acceptance Test Examples

| Scenario | Expected Result |
| --- | --- |
| Active task with fresh `running` heartbeat | Project does not appear in `Needs Action`; detail shows a low-prominence running state. |
| Active task with stale heartbeat | Project appears in `Needs Action` as stale runner, with last heartbeat time. |
| Active task with `waiting_for_human` runner reason | Project appears in `Needs Action` with the runner reason, and the handoff prompt is available only if useful. |
| Active task with `blocked` runner reason | Project appears in `Needs Action` as blocked. |
| Active task with no runner metadata | Project is shown as ready for agent handoff, but not as a human decision. |
| Done task with stale runner metadata | Done phase wins; no task handoff is shown, and stale runner data is ignored or treated as cleanup noise. |
| Invalid runner JSON | Project still loads; diagnostics mention the invalid runner file. |

## Open Questions

| Question | Proposed Default |
| --- | --- |
| Store runner in `.agent/runner.json` or `state.runner`? | Use `.agent/runner.json` for high-frequency heartbeat writes; optionally mirror a summary into ProjectDetail. |
| Default staleness threshold? | Five minutes for UI stale detection, with future configurability. |
| Should `idle + active task` be in `Needs Action`? | No for human-decision alerts; display it as `Agent Handoff` in project detail and possibly a lower-urgency sidebar group later. |
