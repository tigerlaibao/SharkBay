# Spec

## User Goal

When SharkBay installs Ripple files into an existing project, the next agent working in that project should immediately know how to follow the harness. The setup output and generated next-action prompt should point the agent to the right files, phase rules, synchronization duties, verification expectations, and approval stops.

## Problem

Ripple setup currently creates the harness state and task files, but an agent entering the project may not have a root-level instruction file that tells it to read and obey those files before acting. That makes the first post-setup session fragile: the agent could rely on chat context, skip phase discipline, miss JSON/Markdown mirror synchronization, or treat SharkBay as if it had actually executed work rather than generated a prompt.

Existing projects may also already have an `AGENTS.md`, so setup must not blindly overwrite local agent instructions.

## Requirements

| Priority | Requirement | Acceptance Criteria |
| --- | --- | --- |
| P0 | Codex-first onboarding entrypoint | The bundled harness template includes a root-level `AGENTS.md` that instructs agents to read `.agent/protocol.md`, `.agent/manifest.json`, `.agent/state.json`, `.agent/queue.json`, `.agent/queue.md`, `.agent/state.md`, `docs/product.md`, `docs/architecture.md`, `docs/task.md`, and `docs/learnings.md` before acting. |
| P0 | Harness phase discipline | The instructions tell agents to keep advancing phases within the approved scope, obey dependency locks, write phase artifacts, keep mirrors synchronized, checkpoint work, and stop only at real approval or intervention gates. |
| P0 | Safe setup behavior | Existing-project setup keeps the current no-overwrite safety model for `AGENTS.md`; if the file already exists, setup reports the conflict instead of replacing or merging it silently. |
| P0 | Prompt entry correctness | SharkBay's generated handoff prompt mentions `AGENTS.md` when present or expected, names the selected project path, task id, current phase, required startup files, autonomous phase progression, mirror synchronization, subagent use, and checkpoint commits, while leaving detailed stop rules and checks in the harness protocol and task artifacts. |
| P1 | Clear conflict recovery | If `AGENTS.md` already exists, setup should give the user enough information to decide whether to preserve it, manually merge Ripple instructions, or rerun setup after resolving the conflict. |
| P1 | Future agent formats are not blocked | The design leaves room for optional future instruction files for other tools without adding them in this slice. |
| P1 | Verification plan is explicit | The contract includes `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `git diff --check`, and `npm run dev` as required checks unless a later approval stop changes the scope. |

## Non-Goals

- Direct Codex execution or background automation from SharkBay.
- Supporting every non-Codex agent-specific instruction format in the first implementation.
- Automatically editing, appending to, or semantically merging an existing `AGENTS.md`.
- Changing the harness phase model.
- Running package managers, deployment commands, or project-specific setup commands during setup.
- Publishing, deployment, or production changes.

## Proposed Defaults

| Question | Decision |
| --- | --- |
| Should the first implementation create only `AGENTS.md`, or also prepare optional instructions for other agent tools later? | Create `AGENTS.md` only in this slice because Codex is the primary harness agent. Keep the template and installer structured so future tool-specific instruction files can be added deliberately. |
| How should setup behave if an existing project already has an `AGENTS.md`? | Treat it like any other existing destination file: fail preflight for that path, preserve the file, and show a conflict that the user can resolve manually. |

## Acceptance Test Examples

| Scenario | Expected Result |
| --- | --- |
| Create a new managed project from the bundled template | The new project contains `AGENTS.md` with startup reading rules and phase discipline. |
| Set up Ripple in an existing empty project with no `AGENTS.md` | Setup writes the harness files including `AGENTS.md` after user confirmation. |
| Set up Ripple in a project that already has `AGENTS.md` | Setup refuses or reports the file conflict without overwriting the existing file. |
| Generate a next-action prompt for a managed project | The prompt directs the agent to read `AGENTS.md` and the core harness files, then continue across phases until done, blocked, or stopped by a human-intervention condition. |
| Generate a prompt for a setup-created project | The prompt does not imply SharkBay ran Codex; it asks the user to paste the prompt into an agent session. |

## Open Questions

| Question | Impact | Proposed Default |
| --- | --- | --- |
| Should setup eventually offer a guided merge for existing `AGENTS.md` files? | Could improve adoption for projects that already have local instructions. | Defer; first implementation should preserve no-overwrite semantics and expose the conflict clearly. |
| Should non-Codex instruction files be templated later? | Different tools may read different entrypoint names. | Defer until there is a named target tool and a design review for multi-agent instruction formats. |
