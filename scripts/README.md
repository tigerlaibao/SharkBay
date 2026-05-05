# Scripts

This directory stores project-local automation that helps AI assistants and humans verify work repeatably.

## Rules

- Prefer scripts for task-specific validation when existing test commands are not enough.
- Keep scripts small and named after the behavior they verify.
- Scripts should print clear pass/fail evidence.
- Scripts should return non-zero on failure.
- Scripts must not require secrets unless explicitly documented.
- Scripts must not mutate production data.

## Naming

Examples:

```text
scripts/verify-auth-flow.sh
scripts/check-fixtures.ts
scripts/inspect-build-output.mjs
```

## Recording Evidence

When a script is used for a task, record this in `tasks/<task-id>/verification.md`:

- Script command
- Exit code
- Output excerpt
- Any generated artifact path
