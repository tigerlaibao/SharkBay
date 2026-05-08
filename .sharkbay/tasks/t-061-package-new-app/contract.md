# Contract

## Scope

- Use the existing package configuration and scripts to build a fresh local macOS `.app`.
- Do not change product code or packaging configuration unless the existing packaging path fails.
- Keep generated build output under the existing ignored `release/` directory.
- Record command and artifact evidence in the task verification file.

## Verification

- `npm run pack`
- Artifact check confirms the newly generated `.app` exists under `release/`.
- Record output excerpts and artifact path in `.sharkbay/tasks/t-061-package-new-app/verification.md`.
