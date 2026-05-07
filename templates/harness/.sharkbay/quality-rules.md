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
- Material assumptions, tradeoffs, and blocking questions are explicit, or the task records that none are blocking.
- Risks and edge cases are listed.
- Verification approach is clear.

## Code Review Gate

Code passes only when:

- blocker = 0
- major = 0
- Implementation matches the task contract.
- No unrelated changes are introduced.
- The diff is the simplest sufficient implementation for the contract; new abstraction or broad refactoring has a recorded reason.
- Changed files are traceable to the user goal, task contract, review finding, or verification failure.
- Errors and edge cases are handled.
- Required checks have run, or skipped checks are justified.

## Verification Gate

Verification passes only when:

- Required commands/checks were run successfully, or skipped checks are justified.
- Each done criterion has corresponding evidence, or a residual risk is recorded.
- Verification records command, exit code, and relevant output excerpt for command checks.
- Critical logic was cross-validated by tests, fixtures, or validation scripts when reasonable.

## Behavioral Discipline

- Ask or record assumptions before implementation when ambiguity affects scope, safety, data shape, UX, or verification.
- Do not add speculative architecture, configuration, indirection, or generic frameworks.
- Do not remove required safety checks in the name of simplicity.
- Treat unrelated cleanup as a separate task unless the cleanup is required for the current change.
