# Task Status

## Metadata

| Field | Value |
| --- | --- |
| Task ID | `t-010-agent-onboarding-instructions` |
| Title | Ensure setup projects instruct agents to follow Ripple harness |
| Priority | 1 |
| Phase | done |
| Owner Role | Controller |
| Depends On | `t-009-human-intervention-policy` |
| Created | 2026-05-05 |
| Updated | 2026-05-05 |

## Goal

When SharkBay sets up Ripple files in an existing project, make sure the model working inside that project receives a clear entrypoint for following the harness protocol, including startup reading rules, phase discipline, state synchronization, and approval stops.

## Scope

In scope:

- Define how setup should install or surface agent-facing instructions for harness-enabled projects.
- Decide whether the bundled harness template should include root-level model instruction files such as `AGENTS.md`.
- Define how SharkBay should generate the next-action prompt so agents enter the harness correctly.
- Preserve the existing no-overwrite and confirmation safety model for setup writes.

Out of scope:

- Implementing direct Codex invocation.
- Supporting every non-Codex agent-specific instruction format in the first slice.
- Changing the core phase model without a design review.
- Running package managers, deployment commands, or project-specific setup commands.

## Current Gate

| Gate | Status | Notes |
| --- | --- | --- |
| Dependencies | pass | `t-009-human-intervention-policy` is done. |
| Spec | pass | `spec.md` written with requirements, non-goals, acceptance criteria, resolved defaults, and deferred open questions. |
| Design review | pass | `design-review.md` found blocker=0 and major=0. |
| Contract | pass | `contract.md` names done criteria, files in/out of scope, required checks, stop conditions, and dependency lock. |
| Code review | pass | `code-review.md` found blocker=0 and major=0; one minor status-note issue was fixed during review. |
| Verification | pass | `verification.md` records command evidence; automated checks passed, and dev startup blockage is documented with lsof/curl smoke evidence. |
| Docs update | pass | `docs/task.md`, `docs/product.md`, `docs/learnings.md`, queue/state mirrors, and final status were updated. |

## Next Action

Ready for the next task.

## Open Questions

| Question | Blocks Phase | Owner |
| --- | --- | --- |
| Should setup eventually offer a guided merge for existing `AGENTS.md` files? | future task | Controller |
| Should non-Codex instruction files be templated later? | future task | Controller |

## Historical Pre-Coding Check Notes

These checks were run during the `intake -> spec` controller pass because the user named them explicitly, even though the task has not reached coding or verification.

Current coding evidence is recorded in `tasks/t-010-agent-onboarding-instructions/implementation.md`.

| Command | Result | Evidence |
| --- | --- | --- |
| `npm run typecheck` | pass | TypeScript renderer and node projects completed with exit code 0. |
| `npm run lint` | pass | Lint script delegates to `npm run typecheck`; completed with exit code 0. |
| `npm test` | pass | Vitest reported 8 files and 37 tests passed. |
| `npm run build` | pass | Node TypeScript compile and Vite production build completed with exit code 0. |
| `git diff --check` | pass | Completed with exit code 0 and no whitespace errors. |
| `npm run dev` | blocked | Vite failed because port `5173` is already in use. `lsof -nP -iTCP:5173 -sTCP:LISTEN` found one `node` Vite listener from another local project on `[::1]:5173` and one existing SharkBay Vite listener on `127.0.0.1:5173`. `curl -I http://127.0.0.1:5173` returned HTTP 200 from the existing SharkBay dev server. No processes were stopped. |

## History

| Date | Phase | Summary |
| --- | --- | --- |
| 2026-05-05 | docs_update -> done | Documentation and mirrors updated; task marked done. |
| 2026-05-05 | verification -> docs_update | Verification passed with full command evidence; `npm run dev` remains blocked by occupied port `5173`, while the existing server returns HTTP 200. |
| 2026-05-05 | code_review -> verification | Code review passed with blocker=0 and major=0; fixed one minor status-note wording issue. |
| 2026-05-05 | coding -> code_review | Implemented the `AGENTS.md` template and focused setup/prompt tests; required checks passed except `npm run dev`, which is blocked by occupied port `5173` while an existing server returns HTTP 200. |
| 2026-05-05 | contract -> coding | Dependency lock passed because `t-009-human-intervention-policy` is done; opened coding. |
| 2026-05-05 | design_review -> contract | Wrote the implementation contract with explicit files, checks, done criteria, dependency lock, and stop conditions. |
| 2026-05-05 | design -> design_review | Reviewed the onboarding instruction design and passed it with no blockers or major findings. |
| 2026-05-05 | spec -> design | Wrote the design for adding a root `AGENTS.md` template, preserving no-overwrite setup conflicts, and keeping next-action prompts harness-aware. |
| 2026-05-05 | spec | Wrote the onboarding instruction spec, choosing Codex-first `AGENTS.md`, no-overwrite setup behavior, and harness-aware prompt requirements. |
| 2026-05-05 | intake | Opened the task from the user request to make setup projects instruct future agents to follow the Ripple harness. |
