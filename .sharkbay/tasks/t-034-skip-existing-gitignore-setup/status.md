# t-034-skip-existing-gitignore-setup

## Status

- Title: Skip existing project gitignore during Ripple setup
- Phase: done
- Status: done
- Priority: 1
- Depends on: none
- Created: 2026-05-06T23:35:57+08:00
- Updated: 2026-05-06T23:37:13+08:00
- Completed: 2026-05-06

## User Goal

Ripple setup for an existing project should not fail only because the project already has a root `.gitignore`. The existing `.gitignore` is project-owned and must be preserved.

## Done Criteria

- Existing-directory Ripple setup skips the template `.gitignore` when the target already has one.
- New project setup still seeds the template `.gitignore`.
- Real collisions for version-owned setup files such as `AGENTS.md`, `.agent/**`, `docs/**`, and `tasks/**` still fail without partial writes.
- Regression tests cover the existing `.gitignore` case.

## Notes

- Assumption: the screenshot path `/Users/shark/Projects/ItsMyLife/.gitignore` is a configured not-setup project selected inside SharkBay, not this Codex workspace.
- Completed with focused installer regression coverage plus full test, typecheck, build, and diff checks passing.
