# Design

## Behavior

Setup should make the harness self-explanatory to the next model session by installing a Codex-readable root entrypoint:

- Add `templates/harness/AGENTS.md` to the bundled harness template.
- The file should instruct agents to read the repository harness files before acting, use `.agent/protocol.md` as the source of truth, advance autonomously through allowed phases, keep Markdown and JSON mirrors synchronized, obey dependency locks, preserve no-overwrite safety, record evidence, and stop at approval or human-intervention gates.
- The file should be generic enough for newly created projects and existing-project Ripple setup, using the harness file names rather than SharkBay-specific local paths.

The existing template installer already copies every regular file under `templates/harness` and preflights all target files before writing. That means `AGENTS.md` can be added as an ordinary template file without a special copy path.

## Existing-Project Conflict Behavior

Keep the current no-overwrite model:

- If an existing project has `AGENTS.md`, `copyTemplateTree` should detect the destination collision before writing any template file.
- Setup should return `file-collision` with the existing "Refusing to overwrite existing file" message.
- The renderer can continue using the existing setup error surface; no automatic merge or append behavior is introduced in this slice.
- Guided merge for pre-existing instruction files is deferred because it would need product copy, diff/merge behavior, and additional review.

This preserves local project instructions and keeps setup reversible: the user can manually merge Ripple instructions, remove or rename the conflicting file, then rerun setup.

## Prompt Generation

`generateNextActionPrompt` should remain concise and defer detailed rules to on-disk files. It should continue to include:

- The selected project path.
- `AGENTS.md` as the first startup file.
- `.agent/protocol.md`, manifest, state, queue, task status, and contract when applicable.
- Current project name, task id, and phase.
- Autonomous phase progression until done, blocked, or human intervention is required.
- Subagent use for independent exploration, review, or verification.
- JSON/Markdown mirror synchronization, required checks, and focused checkpoint commits.

The prompt must not imply SharkBay executed Codex or completed work. It is a handoff the user can paste into an agent session.

## UI and API

No new IPC contract is needed for the first slice.

- `createHarnessRepo` already returns written file paths and failure reasons.
- New project creation and existing-directory setup should naturally include `AGENTS.md` in the returned `files` list when setup succeeds.
- Existing collision messaging is acceptable for the first slice, though future UI polish may translate `file-collision` on `AGENTS.md` into a clearer "manual merge needed" hint.

## Files

| File | Change |
| --- | --- |
| `templates/harness/AGENTS.md` | Add Codex-first harness onboarding instructions. |
| `tests/template-installer.test.ts` | Assert successful template installs include `AGENTS.md`; assert an existing `AGENTS.md` blocks setup without overwrite. |
| `tests/prompt-generator.test.ts` | Keep prompt expectations aligned with the `AGENTS.md` startup entrypoint and autonomous harness handoff. |
| `tasks/t-010-agent-onboarding-instructions/*` | Record phase artifacts, review, implementation notes, and verification evidence. |
| `.agent/queue.*`, `.agent/state.*`, `docs/task.md` | Keep phase and task mirrors synchronized. |

## Risks and Edge Cases

| Risk | Mitigation |
| --- | --- |
| Existing projects with their own `AGENTS.md` cannot complete setup in one click. | Preserve no-overwrite behavior and report the collision; defer guided merge to a future task. |
| The generated instructions become stale relative to `.agent/protocol.md`. | Keep `AGENTS.md` as a startup pointer and short operating summary, with protocol as source of truth. |
| Adding a root file changes successful setup file counts or returned file lists. | Update focused template installer tests. |
| Prompt wording duplicates too much protocol detail. | Keep prompt concise and verify it does not inline required checks or stop condition lists. |

## Rollout

This is a template and prompt-generation change only. Existing managed projects are not migrated automatically. New managed projects and future existing-project setup attempts receive `AGENTS.md` when no conflicting root file exists.

## Verification

Required checks for the contract:

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`
- `git diff --check`
- `npm run dev` or a documented dev-server smoke result if the default port is already occupied

Focused validation should include template installer tests for success and collision behavior, plus prompt generator tests for `AGENTS.md` handoff wording.
