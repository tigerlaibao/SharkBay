# Codex Controller Protocol

## 1. Purpose

This protocol defines how Codex should act as the controller for this repository.

The controller coordinates planning, design, review, implementation, verification, documentation updates, and task state transitions.

## 2. Controller Loop

When asked to advance work:

```text
load AGENTS.md
load .agent/protocol.md
load .agent/manifest.json
load .agent/state.json
load .agent/queue.json
load .agent/runner.json if present
load .agent/queue.md
load .agent/state.md
detect repository identity if missing
select highest-priority active task
check task dependency locks
load tasks/<task-id>/status.md
write or refresh runner status while physically working
execute the next needed phase
write phase artifact and checkpoint commit
update task status and queue/state mirrors
release or update runner status when stopping
continue to the next phase while scope and stop conditions allow
report concise result to user
```

Default to autonomous forward progress. Continue across phases within the approved task scope until the task is done, blocked, or a stop condition requires human intervention. Do not pause between routine phases just to ask the user to say "continue".

## 2.1 Machine-Readable State

This harness uses both Markdown and JSON:

- Markdown files are for humans and AI reasoning.
- JSON files are for SharkBay, scripts, dashboards, and reliable scanning.

Keep these files synchronized:

| Human-readable | Machine-readable |
| --- | --- |
| `.agent/state.md` | `.agent/state.json` |
| `.agent/queue.md` | `.agent/queue.json` |
| `tasks/<task-id>/status.md` | task entries in `.agent/queue.json` |

If there is a conflict, treat the task's `tasks/<task-id>/status.md` as the detailed task source of truth, then update the JSON mirror.

## 3. Phases

Allowed phases:

```text
intake
spec
design
design_review
design_revision
contract
coding
code_review
code_revision
verification
docs_update
done
blocked
```

## 4. Role Mapping

The same model may play different roles, but roles must be separated by phase and artifact.

| Phase | Role | Primary Artifact |
| --- | --- | --- |
| intake | Controller | `tasks/<task-id>/status.md` |
| spec | Planner | `tasks/<task-id>/spec.md` |
| design | Designer | `tasks/<task-id>/design.md` |
| design_review | Reviewer | `tasks/<task-id>/design-review.md` |
| design_revision | Designer | `tasks/<task-id>/design.md` |
| contract | Planner + Reviewer | `tasks/<task-id>/contract.md` |
| coding | Implementer | code + `tasks/<task-id>/implementation.md` |
| code_review | Reviewer | `tasks/<task-id>/code-review.md` |
| code_revision | Implementer | code + `tasks/<task-id>/implementation.md` |
| verification | Verifier | `tasks/<task-id>/verification.md` |
| docs_update | Maintainer | `docs/task.md`, `docs/learnings.md`, relevant docs |
| done | Controller | `tasks/<task-id>/status.md` |

## 5. Transition Rules

### intake -> spec

Allowed when:

- User goal is captured.
- Task id exists.
- Initial priority is set.
- Open questions are listed.

### spec -> design

Allowed when:

- Scope is clear.
- Non-goals are listed.
- Acceptance criteria exist.
- Material assumptions, tradeoffs, and blocking questions are recorded, or the task explicitly has none.

### design -> design_review

Allowed when:

- Design covers behavior, data, UI/API implications, risks, and rollout.
- Files/modules likely to change are listed.

### design_review -> design_revision

Required when:

- Any blocker or major issue exists.

### design_review -> contract

Allowed when:

- Blocker count is 0.
- Major count is 0.
- Minor issues are either accepted or tracked.

### contract -> coding

Allowed when:

- All dependency tasks are `done`, unless the user explicitly overrides the dependency lock.
- Done criteria are explicit.
- Each done criterion is mapped to at least one verification method, or an explicit reason is recorded.
- Files in scope are named.
- Files out of scope are named.
- Required checks are listed.
- Stop conditions are listed.

### coding -> code_review

Allowed when:

- Implementation notes are written.
- User-visible behavior is summarized.
- Known risks are listed.
- Changes are traceable to the user goal, task contract, review finding, or verification failure.
- Required automated checks from `contract.md` have run, or inability to run them is recorded with the exact error.

### code_review -> code_revision

Required when:

- Any blocker or major issue exists.

### code_review -> verification

Allowed when:

- Blocker count is 0.
- Major count is 0.
- Required review findings are addressed.

### verification -> docs_update

Allowed when:

- Required checks have run, or inability to run them is recorded.
- Results and evidence are written to `verification.md`.
- Critical logic is covered by tests or validation scripts, unless the user explicitly accepts manual-only verification.

### docs_update -> done

Allowed when:

- `docs/task.md` reflects completed work.
- `docs/learnings.md` is updated if a durable lesson was learned.
- `status.md` has final outcome and verification summary.

## 6. Approval Stops

Stop and ask the user before:

- Expanding task scope significantly.
- Making destructive changes.
- Changing architecture beyond the approved design.
- Skipping required verification.
- Touching secrets, credentials, billing, or production data.
- Merging, releasing, deploying, or publishing.

## 7. Human Intervention Discipline

SharkBay's `Needs Action` surface is for human intervention, not general task progress.

Default rule:

- Keep ordinary active work quiet while a runner is explicitly `running`, `working`, `executing`, or `in_progress`.
- If there is an active, non-done task and SharkBay has no running agent for it, show `Needs Action` as an agent handoff, not as a product decision.
- Show a project in `Needs Action` when a human must decide, approve, unblock, accept risk, provide missing information, or copy the generated prompt into an external agent/IDE to continue.

Requires human intervention:

- Agent handoff is required when a task is active and non-done, but no runner is currently marked as running.
- `phase=blocked` or `gateStatus=blocked`.
- A task explicitly records `requiresUserAction: true`, `userActionRequired: true`, or a user-action reason.
- An approval stop is reached: significant scope expansion, destructive change, architecture change beyond approved design, skipped required verification, secrets/credentials/billing/production data, merge, release, deploy, or publish.
- A dependency lock needs user override.
- A blocking open question is owned by the user/product and blocks the current phase.

Does not require human intervention by itself:

- Ordinary `intake`, `spec`, `design`, `design_review`, `design_revision`, `contract`, `coding`, `code_review`, `code_revision`, `verification`, or `docs_update` phases while a runner is active.
- `done` phases.
- Dirty worktree from the active work session.
- Review findings that can be addressed inside the approved scope.
- Verification failures that can be fixed inside the approved scope.

When human intervention is required, record the reason in the task status, queue/state metadata, or decision log so SharkBay can show the reason instead of guessing.

## 8. Dependency Locks

Task dependencies are hard gates.

Before moving a task into `coding`, the controller must:

1. Read the task's dependency list from `.agent/queue.md` and `tasks/<task-id>/status.md`.
2. Confirm each dependency task is marked `done`.
3. Refuse to enter `coding` if any dependency is not done.
4. Mark the task `blocked` if the dependency cannot be resolved immediately.

The user may explicitly override a dependency lock, but the override must be recorded in `tasks/<task-id>/decisions.md`.

## 9. Evidence Discipline

Verification must leave evidence, not just claims.

For command-based checks, record:

- Command
- Exit code
- Relevant console output excerpt
- Full log path if output is long

For UI or browser checks, record:

- Screenshot path, video path, or trace path
- Viewport or device used
- Interaction steps performed

For critical logic, prefer tests or validation scripts over manual observation.

If no test framework exists, create a small project-local validation script under `scripts/` when reasonable, or record why this was not possible.

## 10. State Discipline

Every phase must update `tasks/<task-id>/status.md`.

Do not mark a task done unless:

- The phase is `done`.
- Verification has a recorded result.
- Remaining risks are explicitly documented.

## 11. Git Checkpoint Discipline

Commit frequently so work can be rolled back by phase or implementation slice.

Required checkpoints:

- After task intake/spec/design/contract artifacts are created or materially revised.
- After each coding slice that leaves the app compiling or otherwise reaches a useful rollback point.
- After addressing review findings before re-entering review, when the patch is coherent.
- After verification/docs_update when a task is marked `done`.

Commit rules:

- Keep commits focused on one phase or one coherent behavior change.
- Write commit messages that explain what changed, not just which files changed.
- Run the checks required by the task contract before committing code changes, or record why they could not run.
- Do not mix unrelated user changes into a commit.
- Do not commit secrets, generated dependency folders, build output, or local runtime data.
- If the repository has no commits yet, create an initial baseline commit before continuing substantial work.

Decision log rule:

- When appending `.agent/state.json` `recentDecisions`, use an ISO timestamp with timezone when available, not a date-only string.

## 12. Runner Lifecycle Discipline

Harness task phase describes engineering state. Runner lifecycle describes whether a physical agent session is actually working. Do not infer one from the other.

Use optional `.agent/runner.json` for cooperative runner state:

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

Allowed stored statuses:

- `idle`
- `running`
- `blocked`
- `waiting_for_human`

Rules:

- At the start of active work, write `status=running`, a stable `sessionId`, `owner`, `taskId`, `phase`, `startedAt`, and `heartbeatAt`.
- Refresh `heartbeatAt` during long work and when changing phase.
- Use `waiting_for_human` only when a human decision, approval, credential, or external action is actually required.
- Use `blocked` when work cannot proceed without a non-routine dependency or unavailable authority.
- Use `idle` when there is no active runner and no human decision is being requested.
- If the process dies or stops updating the file, SharkBay may derive `stale` from the old heartbeat.
- Do not store secrets, PIDs, private IDE state, or transient logs in `.agent/runner.json`.

## 13. Developer Metadata Discipline

Project agents maintain stable developer metadata in `.agent/development.json`.

Rules:

- Treat SharkBay project detail as read-only whenever possible; do not ask users to manually set metadata that the project agent can discover and maintain.
- Store stable development facts in `.agent/development.json`: stack, package manager, setup commands, common scripts, stable endpoints, expected ports, tools, and concise notes.
- Keep dynamic or one-off facts out of `.agent/development.json`: running PIDs, temporary preview URLs, transient port probes, one task's deployment logs, and verification evidence.
- Do not write secrets, tokens, private credentials, or authenticated dashboard URLs into developer metadata.
- At contract time, state whether the task may change developer metadata.
- Before code review, record whether developer metadata changed, did not change, or is unknown.
- Before done, verify metadata still matches changed scripts, ports, deployment surfaces, and tools.
- Missing metadata is acceptable; stale or contradictory metadata is a review finding.

## 14. Parallel Agent Discipline

Use subagents whenever they can safely shorten feedback loops or improve review quality without blocking the controller's immediate next step.

Default expectation:

- Prefer running independent exploration, review, and verification subtasks in parallel when the work is separable.
- Keep moving locally while subagents work; do not wait unless their result blocks the next decision.
- Use worker subagents for implementation only when file ownership is disjoint and the task can be bounded clearly.
- Do not use subagents as a reason to delay progress or hand coordination back to the user.

Recommended uses:

- Independent read-only code exploration.
- Design review, code review, and verification review.
- Focused risk scans after a local implementation slice.
- Distinct implementation subtasks only when write ownership is disjoint and explicit.

Coordination rules:

- The controller keeps overall task ownership and integrates results.
- Do not delegate the immediate critical-path task if waiting would block local progress.
- Tell worker agents they are not alone in the codebase and must not revert others' work.
- Keep write scopes disjoint when multiple workers edit files.
- Record material subagent findings in the relevant task artifact when they affect a gate decision.

## 15. UX Entity Discipline

如无必要，勿增实体. Do not add UI entities without a necessary user job.

Rules:

- Every visible element must earn its place by helping the user decide, act, understand current context, or recover from a problem.
- Do not repeat the same fact in nearby places. Pick one canonical surface for each fact.
- Do not create labels, badges, cards, counters, panels, or empty states that merely restate what layout, grouping, or context already communicates.
- Treat sentinel values like `none`, `unknown`, `unset`, `null`, or empty strings as absent content, not display text.
- Normal, empty, clean, successful, or internal states should stay quiet unless the user is actively checking that state or needs it to make a decision.
- Numeric ranks or priorities should only be visible when they differentiate items or affect ordering, and should carry a clear label such as `P1` rather than a bare number.
- Work queues should make recency legible; when priority is equal, newer task identifiers should appear before older ones unless the user needs chronological history.
- Match prominence to frequency and urgency. Frequent or urgent actions may be visible; rare setup, configuration, and maintenance actions should be secondary or intentionally entered.
- Brand, decorative chrome, and page titles are optional in personal or internal tools; include them only when they improve orientation, trust, or navigation.
- Prefer progressive disclosure for long, low-frequency, diagnostic, or reference content.
- When optional content disappears, the remaining content should use the available space naturally instead of preserving dead layout slots.
- Prefer removing an entity over explaining it when it does not create a new user action, decision, or understanding.

## 16. Behavioral Discipline

Use these rules as a lightweight guardrail across all phases:

- Clarify material ambiguity before implementation. If the task can reasonably mean different things, record assumptions, tradeoffs, or blocking questions in the current phase artifact.
- Prefer the simplest implementation that satisfies the task contract. Do not introduce a new abstraction, configuration layer, generalized framework, or broad refactor unless it removes real duplication, reduces real risk, or is already the local pattern.
- Keep changes traceable. Every changed file should connect to the user goal, task contract, review finding, or verification failure; unrelated cleanup belongs in a separate task.
- Bind goals to verification early. Contract done criteria should name the command, test, script, manual check, or evidence type that will prove each criterion.
- Simplicity does not weaken safety. Required guards for filesystem containment, IPC trust boundaries, schema validation, data integrity, credentials, billing, production data, and destructive operations remain mandatory even when they add complexity.
