# Implementation Contract

## Scope

Implement the first Codex-first onboarding slice for Ripple setup projects.

## Files In Scope

| File | Expected Change |
| --- | --- |
| `templates/harness/AGENTS.md` | Add root agent onboarding instructions for new and setup-managed projects. |
| `tests/template-installer.test.ts` | Verify `AGENTS.md` is installed and root `AGENTS.md` collisions are rejected without partial writes. |
| `tests/prompt-generator.test.ts` | Keep next-action prompt assertions aligned with the `AGENTS.md` startup handoff. |
| `tasks/t-010-agent-onboarding-instructions/implementation.md` | Record implementation notes, user-visible behavior, checks, and known risks. |
| Harness mirrors | Keep `.agent/queue.*`, `.agent/state.*`, `tasks/t-010-agent-onboarding-instructions/status.md`, and `docs/task.md` synchronized. |

## Files Out Of Scope

| File/Area | Reason |
| --- | --- |
| Existing project root `AGENTS.md` files outside the template | No automatic migration or merge in this slice. |
| Direct Codex invocation or runner code | Product scope remains prompt generation, not execution. |
| Non-Codex instruction files | Deferred until a named target format is designed. |
| Core phase model in `.agent/protocol.md` | No protocol model change is required. |
| Package/deployment setup commands for target projects | Setup must not run project-specific commands. |

## Done Criteria

- `templates/harness/AGENTS.md` exists and names the startup files and harness operating rules required by the spec.
- New project/template setup returns `AGENTS.md` in the written file list.
- Existing-directory setup refuses to overwrite a pre-existing root `AGENTS.md`.
- Collision tests confirm no partial harness files are written after an `AGENTS.md` preflight failure.
- Generated next-action prompts continue to mention `AGENTS.md`, autonomous harness progression, subagents, mirror synchronization, required checks, and checkpoint commits without inlining detailed check or stop-condition lists.
- Implementation notes and task status are updated.

## Required Checks

| Command | Required |
| --- | --- |
| `npm run typecheck` | yes |
| `npm run lint` | yes |
| `npm test` | yes |
| `npm run build` | yes |
| `git diff --check` | yes |
| `npm run dev` | yes, or record exact blockage and smoke-test any already-running SharkBay dev server without stopping unrelated processes |

## Stop Conditions

Stop and ask the user before:

- Replacing, appending to, or semantically merging any existing `AGENTS.md`.
- Adding non-Codex instruction file formats.
- Changing setup safety semantics away from preflight no-overwrite behavior.
- Changing the harness phase model or dependency-lock policy.
- Touching secrets, credentials, billing, deployment, publishing, or production data.
- Skipping required verification without recording and getting explicit acceptance.

## Dependency Lock

`t-009-human-intervention-policy` is done, so coding may begin after this contract gate.
