# Spec

## Problem

Current Ripple setup writes harness files across several root-level locations: `AGENTS.md`, `.agent/`, `docs/`, and `tasks/`, plus a seeded `.gitignore`. That is too intrusive for existing external projects because it competes with project-owned docs, task folders, and ignore rules.

## Goal

New setup should keep the target project's root impact to:

- `AGENTS.md`
- `.sharkbay/`

All other durable SharkBay/Ripple files should live under `.sharkbay/`.

## Proposed Layout

```text
AGENTS.md

.sharkbay/
  manifest.json
  state.json
  queue.json
  queue.md
  state.md
  development.json
  protocol.md
  quality-rules.md
  template-sync.json
  docs/
    product.md
    architecture.md
    task.md
    learnings.md
  tasks/
    _template/
      status.md
    t-001-initial-task/
      status.md
      spec.md
      design.md
      design-review.md
      contract.md
      implementation.md
      code-review.md
      verification.md
      decisions.md
```

Runtime-only files should also stay under `.sharkbay/`, but in a clearly ignorable subpath such as `.sharkbay/runtime/` if implementation needs a place for high-churn local state. The precise runtime subpath can be decided during design.

## Requirements

- New SharkBay-created or setup-managed projects install the contained `.sharkbay/` layout.
- Root `AGENTS.md` remains the agent entrypoint and tells target agents to read `.sharkbay/protocol.md`, `.sharkbay/state.json`, `.sharkbay/queue.json`, `.sharkbay/docs/*`, and active task artifacts under `.sharkbay/tasks/`.
- Existing `.agent/` projects continue to scan, render, generate prompts, and sync safely during a compatibility period.
- The scanner/reader should prefer `.sharkbay/` when both layouts exist, while surfacing a diagnostic for mixed layouts.
- Template sync should own only version-owned control files in the new layout, plus `AGENTS.md`.
- Project-owned files remain project-owned after install: manifest, state, queue, development metadata, docs, tasks, decisions, and verification evidence.
- No setup path may overwrite project-owned root `docs/`, root `tasks/`, `.agent/`, `.sharkbay/`, or `AGENTS.md` without explicit human approval.

## Non-Goals

- No automatic deletion of old `.agent/`, root `docs`, or root `tasks` files in this task.
- No automatic `.gitignore` edit or merge in this task.
- No data migration UI beyond compatibility detection unless required for safe reads.
- No rename of the public product's local dogfood harness during this first compatibility slice.

## Compatibility Strategy

- Add a normalized harness layout resolver with at least two known layouts:
  - `contained`: root `AGENTS.md` plus `.sharkbay/`.
  - `legacy`: root `AGENTS.md`, `.agent/`, root `docs/`, root `tasks/`.
- Use the resolver in scanner, harness reader, prompt generator, setup installer, template sync, and tests instead of hard-coded path assumptions.
- Prefer contained layout for new writes.
- Keep legacy reads stable until `t-039-legacy-harness-file-cleanup` defines an explicit cleanup/migration path.

## Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Mixed layout confusion | SharkBay may read stale state from the wrong place | Prefer `.sharkbay/`, surface diagnostics, and keep tests for both layouts |
| Prompt drift | Target agent may read old `.agent` instructions | Update prompt generation and `AGENTS.md` template together |
| Template sync overwrites project state | External project history could be corrupted | Keep strict version-owned allowlist and project-owned exclusions |
| Self-host dogfood mismatch | SharkBay local harness is still legacy | Treat this repo as a legacy compatibility fixture until cleanup is explicitly planned |

## Verification Approach

- Focused scanner/reader tests for contained layout, legacy layout, and mixed layout precedence.
- Template installer tests proving new setup writes `.sharkbay/` and does not write root `docs/`, root `tasks/`, or `.agent/`.
- Prompt generator tests for `.sharkbay/` startup instructions.
- Template sync tests proving only `AGENTS.md`, `.sharkbay/protocol.md`, and `.sharkbay/quality-rules.md` are version-owned.
- Full `npm run typecheck`, focused tests, `npm test`, `npm run build`, and `git diff --check`.

## Blocking Questions

None. User confirmed the minimal-intrusion direction: keep root `AGENTS.md`, move other harness files under `.sharkbay/`, keep legacy compatibility first, and clean old harness files in a later task.
