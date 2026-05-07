# t-030-exclude-gitignore-from-template-sync

## Status

- Title: Exclude project `.gitignore` from harness template sync
- Phase: done
- Status: done
- Priority: 1
- Depends on: t-028-harness-template-sync
- Created: 2026-05-06T22:25:00+08:00
- Updated: 2026-05-06T22:58:00+08:00
- Completed: 2026-05-06

## User Goal

Do not treat project `.gitignore` as a harness-owned file during template sync. It should not appear in stale/missing harness prompts, and sync must not overwrite project-local ignore rules.

## Done Criteria

- `.gitignore` is removed from the version-owned harness sync allowlist.
- SharkBay's root `.gitignore` is restored to ignore local dogfood/runtime files.
- Tests and docs reflect that `.gitignore` is setup-seeded but not sync-owned.

## Notes

- Opened after user questioned why `.gitignore` was shown in the harness sync panel.
- Verified current HEAD consistency after concurrent session changes.
- Product commit containing the fix: `78bfd29 Restore product gitignore rules`.
- Cleared `.agent/runner.json` task claim after completion so the done task no longer appears as a runner registered outside the Active queue.
