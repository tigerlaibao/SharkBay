# Task Status

## Metadata

| Field | Value |
| --- | --- |
| Task ID | `t-008-project-authored-url-metadata` |
| Title | Design project-authored developer metadata |
| Priority | 2 |
| Phase | done |
| Owner Role | Controller |
| Depends On | `t-007-ripple-setup-flow` |
| Created | 2026-05-05 |
| Updated | 2026-05-05 |

## Goal

Move project details toward a read-only model: useful developer information should be extracted and maintained by the project's own agent during harness work, stored in the harness, and displayed by SharkBay without requiring per-project manual settings.

## Scope

In scope:

- Design a manifest-backed metadata shape for project facts that help development.
- Include runtime URLs, local ports, tech stack, scripts, deployment surfaces, tools, and operational notes where useful.
- Define when project agents should update this metadata during initialization, task execution, local server work, and deployment work.
- Build a first read-only SharkBay detail surface for this metadata.
- Keep low-value or stale facts out of the primary detail surface.

Out of scope:

- Running project commands from SharkBay.
- Automatically probing ports or deployments from SharkBay.
- Turning SharkBay into a settings editor for this metadata.
- Building a full plugin/integration system.

## Current Gate

| Gate | Status | Notes |
| --- | --- | --- |
| Dependencies | pass | `t-007-ripple-setup-flow` is done. |
| Spec | pass | User goal expanded from URL metadata to developer metadata. |
| Design review | pass | Subagent findings synthesized into `.agent/development.json` plus narrow summary UI. |
| Contract | pass | Implementation contract recorded. |
| Code review | pass | Self-review passed. |
| Verification | pass | Typecheck, targeted tests, full tests, build, and diff check passed. |
| Docs update | pass | Queue, state, task docs, protocol, and templates updated. |

## Next Action

Ready for the next task.

## Open Questions

| Question | Blocks Phase | Owner |
| --- | --- | --- |

## History

| Date | Phase | Summary |
| --- | --- | --- |
| 2026-05-05 | backlog -> spec | Opened `t-008` with the expanded project-authored developer metadata goal. |
| 2026-05-05 | spec -> coding | Design review and contract passed for the first read-only developer metadata slice. |
| 2026-05-05 | coding -> verification | Implemented optional development metadata reading and read-only summary UI. |
| 2026-05-05 | verification -> done | Verification and docs update passed. |
