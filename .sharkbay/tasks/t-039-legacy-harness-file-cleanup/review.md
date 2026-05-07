# Compatibility Review

## Question

Confirm `t-039-legacy-harness-file-cleanup` is compatible with `t-037-contained-sharkbay-harness-layout` before execution.

## Findings

| Severity | Finding | Evidence | Decision |
| --- | --- | --- | --- |
| blocker | Silent deletion would break the safety model and could move project-owned root `docs` or `tasks` content. | `t-037` intentionally kept legacy projects readable and deferred cleanup. | Cleanup must be explicit and human-gated. |
| major | Whole-directory moves for root `docs/` or `tasks/` are too broad. | External projects can already own those root directories. | Move only known harness docs and task directories with `status.md`; leave unrelated root files in place. |
| major | Migrating SharkBay's own ignored local harness during this product-code task would mix local dogfood state with product behavior. | `t-037` preflight review kept this repo as a legacy compatibility fixture. | Implement the cleanup capability, but do not run it against this repo. |

## Execution Decision

Proceed with an explicit legacy cleanup/migration path:

- Detect legacy harness files in managed projects.
- Refuse if `.sharkbay/` already exists, because mixed-layout cleanup needs a later conflict-specific design.
- Copy/move only recognized harness files into `.sharkbay/`.
- Preserve any unrelated root `docs/` or `tasks/` entries.
- Remove emptied legacy containers only after successful recognized-file moves.
- Expose the action through a confirmed UI/API path; never run it silently.
