# Design

## Approach

Introduce a small layout abstraction before moving templates. SharkBay should understand two harness layouts:

- `legacy`: existing root `AGENTS.md`, `.agent/`, root `docs/`, root `tasks/`.
- `contained`: root `AGENTS.md`, all other harness files under `.sharkbay/`.

All scanner, reader, writer, template sync, prompt, and installer code should use the resolved layout instead of hard-coded `.agent` and root `tasks` paths.

## Layout Rules

| Logical file | Contained path | Legacy path |
| --- | --- | --- |
| manifest | `.sharkbay/manifest.json` | `.agent/manifest.json` |
| state | `.sharkbay/state.json` | `.agent/state.json` |
| queue | `.sharkbay/queue.json` | `.agent/queue.json` |
| state mirror | `.sharkbay/state.md` | `.agent/state.md` |
| queue mirror | `.sharkbay/queue.md` | `.agent/queue.md` |
| development metadata | `.sharkbay/development.json` | `.agent/development.json` |
| runner metadata | `.sharkbay/runner.json` | `.agent/runner.json` |
| protocol | `.sharkbay/protocol.md` | `.agent/protocol.md` |
| quality rules | `.sharkbay/quality-rules.md` | `.agent/quality-rules.md` |
| template sync metadata | `.sharkbay/template-sync.json` | `.agent/template-sync.json` |
| docs | `.sharkbay/docs/` | root `docs/` |
| tasks | `.sharkbay/tasks/` | root `tasks/` |

Root `AGENTS.md` remains shared in both layouts.

## Compatibility

- Scanner detects contained first, then legacy.
- Hidden directory ignore rules allow `.sharkbay` and `.agent`.
- Reader resolves layout once and uses that layout for JSON, runner, development metadata, task directory fallback, and task artifacts.
- Writer resolves the current layout and writes the logical JSON file in that layout.
- Template sync can check/update either layout. New installs write contained metadata.
- Mixed layout is allowed for now; contained wins because it is the new project-owned harness root.

## Template

Move `templates/harness/.agent/*`, root `docs/*`, and root `tasks/*` under `templates/harness/.sharkbay/`. Keep root `AGENTS.md`. Do not migrate this repository's local dogfood `.agent` during this task.

## Risk Handling

- Existing projects remain readable and writable via legacy paths.
- New projects should not create root `docs` or root `tasks`.
- Existing `.agent` and `.sharkbay` both block setup to avoid ambiguous collisions.
- `.gitignore` behavior remains only a compatibility seed until `t-038`; do not expand ignore ownership in this task.

## Verification

- Focused tests for scanner, reader, writer, template installer, template sync, prompt generator, and self-host workflow.
- Full typecheck, test suite, build, and diff whitespace check.
