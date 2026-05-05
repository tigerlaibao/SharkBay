# Task Status

## Metadata

| Field | Value |
| --- | --- |
| Task ID | `t-005-root-child-discovery` |
| Title | Discover ordinary root child projects and show Ripple setup status |
| Priority | 1 |
| Phase | done |
| Owner Role | Controller |
| Depends On | `t-004-user-centered-project-workbench` |
| Created | 2026-05-05 |
| Updated | 2026-05-05 |

## Goal

Let SharkBay scan configured roots as parent folders, list their direct child projects, and clearly show which projects are already managed and which still need Ripple setup.

## Scope

In scope:

- Add a read-only model for ordinary child directories under configured scan roots.
- Distinguish managed projects from not-yet-managed projects in the Projects view.
- Preserve the existing safe filesystem boundary.
- Define the user flow for one-click Ripple setup without immediately performing risky injection.

Out of scope:

- Starting/stopping project dev servers.
- GitHub/deployment integration.
- Injecting files into a non-empty existing project before a confirmation and safety design exists.
- Direct Codex execution from the app.

## Current Gate

| Gate | Status | Notes |
| --- | --- | --- |
| Dependencies | pass | `t-004-user-centered-project-workbench` is done. |
| Spec | pass | Root child discovery acceptance criteria are recorded in `spec.md`. |
| Design review | pass | Additive candidate design passed after narrowing status to managed/not_setup. |
| Contract | pass | Implementation scope, checks, and stop conditions recorded in `contract.md`. |
| Code review | pass | One major selection fallback issue was fixed and reviewed. |
| Verification | pass | Typecheck, scanner tests, renderer workflow tests, full tests, build, and diff check passed. |
| Docs update | pass | Implementation, review, and verification artifacts updated. |

## Next Action

Dogfood the updated Projects view in the running app and then design the confirmation-gated Ripple setup write flow.

## Open Questions

| Question | Blocks Phase | Owner |
| --- | --- | --- |
| Should child discovery recurse beyond direct children? | yes | Product/design |
| What name should the setup action use: Setup Ripple, Manage Project, or Create Ripple? | no | Product/design |

## History

| Date | Phase | Summary |
| --- | --- | --- |
| 2026-05-05 | intake -> spec | Opened the next backend/product task after completing the project-centered UI slice. |
| 2026-05-05 | spec -> design_review | Wrote the scanner/API/UI design for project candidates. |
| 2026-05-05 | design_review -> coding | Design review passed and implementation contract was written. |
| 2026-05-05 | coding -> code_review | Implemented read-only candidates and committed `38d636a`. |
| 2026-05-05 | code_review -> verification | Fixed selection fallback review finding and reran checks. |
| 2026-05-05 | verification -> done | Verification passed and task artifacts were updated. |
