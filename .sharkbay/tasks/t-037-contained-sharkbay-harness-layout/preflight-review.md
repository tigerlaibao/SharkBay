# Preflight Review

## Review Scope

Before implementation, review whether moving new harness installs into `.sharkbay/` can break SharkBay itself, because this repository is also managed by the same local harness being changed.

## Findings

| Severity | Finding | Evidence | Required Guard |
| --- | --- | --- | --- |
| blocker | Do not move templates first. Scanner and reader are hard-coded to legacy `.agent` and root `tasks` paths, so a template-only move would make new `.sharkbay` projects invisible or empty and could leave SharkBay dogfood behavior inconsistent. | `src/main/scanner.ts:139`, `src/main/harness-reader.ts:79`, `src/main/harness-reader.ts:435` | First implementation slice must add a layout resolver and dual-layout read support before changing template output. |
| blocker | Harness writes are legacy-only. URL/state/manifest/queue updates currently resolve only `.agent/*.json`, so a contained project would fail writes or a mixed project could be written through the wrong layout. | `src/main/path-safety.ts:5`, `src/main/harness-writer.ts:28` | Writer APIs must resolve the active project layout from the selected project, preserve revision checks, and write the same layout that was read. |
| major | Template sync is legacy-only and would create or update `.agent/protocol.md` and `.agent/quality-rules.md` even for contained installs if not changed with layout awareness. | `src/main/harness-template-sync.ts:15` | Sync metadata and version-owned file allowlists must be layout-specific: contained uses `.sharkbay/template-sync.json`, `.sharkbay/protocol.md`, and `.sharkbay/quality-rules.md`; legacy remains supported. |
| major | Setup preflight only rejects existing `.agent` and still has `.gitignore` seed behavior. With contained installs, an existing `.sharkbay` must be treated as an existing harness, and `.gitignore` should be delegated to the target project agent in the follow-up task. | `src/main/template-installer.ts:43`, `src/main/template-installer.ts:49` | Installer must refuse existing `.sharkbay`, preserve existing `.agent` collision behavior, and avoid broad ignore-rule ownership. |
| major | Prompt and root instructions currently name only legacy paths. If `AGENTS.md` or generated prompts switch to `.sharkbay` without compatibility language, current SharkBay dogfood sessions and old managed projects can be misled. | `AGENTS.md:9`, `src/main/prompt-generator.ts:25`, `templates/harness/AGENTS.md:9` | Root instructions and generated prompts must be layout-aware or explicitly dual-path during the compatibility period. |
| minor | UI setup copy still promises `.agent`, `docs`, and `tasks`, which will be wrong once contained setup is introduced. | `src/renderer/App.tsx:1547` | Update user-facing copy in the same slice as installer behavior. |

## Impact On This Repository

SharkBay's local dogfood harness currently remains legacy:

- `.agent/`
- root `tasks/`
- `docs/task.md`
- `docs/learnings.md`

Those files are intentionally ignored by public Git and are still the source of truth for this active work. Therefore:

- Do not migrate this repository's local dogfood harness as part of `t-037`.
- Do not rewrite root `AGENTS.md` to contained-only instructions.
- Treat this repository as a required legacy compatibility fixture until `t-039-legacy-harness-file-cleanup`.
- Keep `t-037` implementation focused on product code, templates, tests, and docs that support both layouts.

## Recommended Implementation Order

1. Add a small harness layout resolver with `contained` and `legacy` path maps.
2. Update scanner and reader to prefer contained layout while preserving legacy reads.
3. Update path safety and writer APIs so writes target the resolved layout, not a hard-coded `.agent` path.
4. Update template sync to be layout-aware and keep project-owned files excluded.
5. Move template output under `.sharkbay/` and update setup copy/prompts.
6. Add tests for contained, legacy, and mixed-layout precedence.
7. Only after that, advance `t-038` for target-agent-owned `.gitignore` guidance and `t-039` for old-file cleanup.

## Gate Decision

Proceed only if the implementation starts with compatibility infrastructure. A direct template move or direct self-harness migration is blocked.
