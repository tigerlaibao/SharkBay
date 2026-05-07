# Contract

## Done Criteria

1. SharkBay's product templates under `templates/harness/**` remain tracked and unchanged unless a public-doc issue is found.
   - Verification: `git ls-files templates/harness | wc -l` and diff inspection.

2. SharkBay's own local harness runtime and task history are removed from public Git tracking.
   - Verification: `git ls-files .agent tasks docs/task.md docs/learnings.md` should report no tracked files for those paths after index cleanup.

3. Future local harness state is ignored without ignoring template harness files.
   - Verification: root-anchored `.gitignore` rules and `git check-ignore` probes.

4. Public docs and agent entry instructions are coherent for a fresh clone that does not contain tracked `.agent/` or root `tasks/`.
   - Verification: review updated `AGENTS.md`, `README.md`, and relevant docs references.

5. A content audit is recorded for the files that were previously public-tracked process state.
   - Verification: audit commands and findings recorded in `verification.md`.

## Files In Scope

- `.gitignore`
- `AGENTS.md`
- `README.md`
- `docs/agents.md`
- Git index entries for root `.agent/**`, root `tasks/**`, `docs/task.md`, and `docs/learnings.md`
- Local task artifact `tasks/t-026-public-harness-cleanup/**` for this work record

## Files Out Of Scope

- `templates/harness/**`
- Application source behavior unless tests reveal a direct break
- Git history rewriting
- Deployment/publishing unless explicitly requested after review

## Required Checks

- Content audit search commands over currently tracked harness/process files
- `git diff --check`
- `npm run typecheck`
- `npm test`
- `npm run build`

## Stop Conditions

- Stop and ask if audit finds likely secrets, credentials, tokens, or private third-party data requiring history rewrite or secret rotation.
- Stop before force-pushing or rewriting history.
- Stop before deleting local working-tree harness files from disk.
