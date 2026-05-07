# Implementation

## Summary

Implemented an explicit legacy harness migration path compatible with T037:

- Added a main-process cleanup service that checks legacy `.agent` projects and migrates recognized harness files into `.sharkbay/`.
- Added project detail summary data for cleanup readiness and blockers.
- Added IPC/preload and a confirmed renderer panel for safe migration.
- Added focused tests for contained no-op, successful migration, mixed-layout conflict blocking, and symlink blocking.
- Updated product docs to describe explicit legacy migration and `.gitignore` non-ownership.

## Safety Notes

- The migration does not run during scan/detail reads.
- Mixed `.agent` plus `.sharkbay` layouts are blocked.
- `.gitignore` and root `AGENTS.md` are untouched.
- Root `docs/` and `tasks/` are not moved wholesale; unrelated entries remain in place.
- This repository's own ignored local harness was not migrated.
