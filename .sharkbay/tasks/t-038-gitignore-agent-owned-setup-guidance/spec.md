# Spec

## Scope

SharkBay setup must not create, overwrite, append, or merge a target project's `.gitignore`. Any ignore-rule decision belongs to the target project agent because repository ignore conventions are project-owned.

## Requirements

- New setup does not write `.gitignore`.
- Existing-project setup preserves any existing `.gitignore`.
- The installed initial task asks the target project agent to decide whether runtime-only SharkBay files should be ignored.
- Durable `.sharkbay/` harness files remain trackable by default.

## Non-Goals

- No automatic `.gitignore` merge.
- No universal ignore snippet.
- No cleanup of old setup-seeded `.gitignore` content in existing projects.

## Compatibility With T037

`t-037` moved setup to contained `.sharkbay/` and removed `templates/harness/.gitignore`, so the runtime-only candidate is now `.sharkbay/runner.json`, not `.agent/runner.json`.
