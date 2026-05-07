# Code Review

## Findings

No blocker or major findings.

## Review Notes

- The cleanup service preflights before moving files and refuses mixed layouts, destination conflicts, symlinked sources, and unsafe task directory names.
- Project detail reads only report cleanup status and do not mutate files.
- The UI requires an explicit checkbox confirmation before calling the migration IPC.
- T037 compatibility is preserved because contained projects remain preferred and legacy projects remain readable until migration.
- T038 compatibility is preserved because `.gitignore` is neither written nor moved.
