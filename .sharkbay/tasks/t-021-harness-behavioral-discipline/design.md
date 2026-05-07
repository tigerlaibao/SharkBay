# Design

## Behavior

Add a small "Behavioral Discipline" layer to the existing protocol rather than creating a new phase. The rules fit into existing gates:

- Spec/design: list assumptions and tradeoffs when the request can be interpreted more than one way.
- Contract: every done criterion must have a verification method.
- Coding/code review: prefer minimal, focused diffs and reject changes that cannot be traced to task intent.
- Verification: continue using existing evidence rules.

## Files

SharkBay:

- `AGENTS.md`
- `.agent/protocol.md`
- `.agent/quality-rules.md`
- `docs/agents.md`
- `docs/task.md`
- `docs/learnings.md`
- `tasks/t-021-harness-behavioral-discipline/*`

Templates:

- `templates/harness/AGENTS.md`
- `templates/harness/.agent/protocol.md`
- `templates/harness/tasks/t-001-initial-task/spec.md`
- `templates/harness/tasks/t-001-initial-task/contract.md`

Existing local projects:

- `/Users/shark/Projects/AIBF`
- `/Users/shark/Projects/AIGF`

## Risks

- Existing projects may not have exactly the same harness files as SharkBay.
- AIBF/AIGF writes are outside this repository's writable root and require approval.
- Overly broad "keep simple" language could be misread as removing necessary safety checks, so the rule must preserve explicit safety, data, and IPC boundaries.

## Rollout

Apply changes directly to SharkBay and templates. For AIBF/AIGF, inspect their current harness files and make minimal edits matching each project's existing structure.
