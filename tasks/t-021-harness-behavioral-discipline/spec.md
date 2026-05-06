# Spec

## Scope

Codify four behavioral rules in Ripple harness instructions:

- Clarify material ambiguity before implementation by recording assumptions, tradeoffs, or blocking questions.
- Prefer the simplest implementation that satisfies the task contract.
- Keep code and documentation changes traceable to the task goal, contract, review finding, or verification failure.
- Bind done criteria to concrete verification checks before implementation proceeds.

## In Scope

- Update SharkBay root instructions and harness rule files.
- Update setup templates so future SharkBay-created projects inherit the rules.
- Update local AIBF and AIGF projects directly because the user stated they are small local projects and do not need a formal upgrade workflow.
- Add task artifacts and documentation for the change.

## Non-Goals

- Build a general harness migration or versioned upgrade flow.
- Change SharkBay product UI.
- Change application runtime code.
- Publish, deploy, or merge.

## Acceptance Criteria

- SharkBay's own `AGENTS.md`, `.agent/protocol.md`, and `.agent/quality-rules.md` mention the new behavioral discipline.
- `templates/harness` includes the same discipline for future setup projects.
- AIBF and AIGF get equivalent harness guidance without overwriting unrelated local project content.
- Verification records file presence and JSON/markdown sanity checks.
