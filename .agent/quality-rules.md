# Quality Rules

## Severity

| Severity | Meaning | Gate Impact |
| --- | --- | --- |
| blocker | Cannot proceed safely | Must fix before advancing |
| major | Likely bug, broken requirement, or risky design gap | Must fix before advancing |
| minor | Improvement, cleanup, edge case, or clarity issue | Track or fix |
| note | Useful observation | Does not block |

## Design Review Gate

Design passes only when:

- blocker = 0
- major = 0
- Scope and non-goals are explicit.
- Data/API/UI implications are covered when relevant.
- Risks and edge cases are listed.
- Verification approach is clear.

## Code Review Gate

Code passes only when:

- blocker = 0
- major = 0
- Implementation matches `contract.md`.
- No unrelated changes are introduced.
- Errors and edge cases are handled.
- Required checks from `contract.md` have run, or skipped checks are justified.
- Tests or verification scripts cover the critical path.
- `code-review.md` includes command evidence or explains why command evidence is unavailable.

## Verification Gate

Verification passes only when:

- Required commands/checks were run successfully, or skipped checks are justified.
- `verification.md` records command, exit code, and relevant console output excerpt for each command check.
- Full logs, screenshots, videos, or traces are saved under the repository when useful, and their paths are recorded.
- User-facing behavior was verified when applicable.
- Critical logic was cross-validated by tests or validation scripts, unless the user explicitly accepts manual-only verification.
- Known residual risks are recorded.

## Evidence Requirements

Do not write vague verification such as "tests passed" without evidence.

Acceptable evidence includes:

- Exact command output excerpts.
- Test report paths.
- Screenshot, video, or trace paths.
- Script output with exit code.
- Manual reproduction steps plus observed result, only when automation is not reasonable.

For important business logic, data migration, security behavior, billing, persistence, or parsing, manual observation alone is not enough. Add or run a test, fixture, or validation script.

## Documentation Gate

Documentation passes only when:

- `docs/task.md` reflects current task state.
- Durable lessons are added to `docs/learnings.md`.
- Feature or architecture docs are updated when behavior or design changed.
