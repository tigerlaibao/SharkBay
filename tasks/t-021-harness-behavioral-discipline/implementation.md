# Implementation

## Changes

SharkBay harness:

- Added a Behavioral Discipline section to `AGENTS.md`.
- Added transition-gate requirements and a dedicated Behavioral Discipline section to `.agent/protocol.md`.
- Added ambiguity, simplicity, traceability, and done-criterion evidence checks to `.agent/quality-rules.md`.
- Updated `docs/agents.md` to include the same operational guidance.

Future setup templates:

- Added equivalent guidance to `templates/harness/AGENTS.md` and `templates/harness/.agent/protocol.md`.
- Added `templates/harness/.agent/quality-rules.md` so new setup projects receive the same review/verification gates.
- Replaced placeholder initial `spec.md` and `contract.md` template content with behavioral-discipline prompts and verification mapping.

Existing local projects:

- Updated `/Users/shark/Projects/AIBF/AGENTS.md`.
- Updated `/Users/shark/Projects/AIBF/.agent/protocol.md`.
- Added `/Users/shark/Projects/AIBF/.agent/quality-rules.md`.
- Updated `/Users/shark/Projects/AIGF/AGENTS.md`.
- Updated `/Users/shark/Projects/AIGF/.agent/protocol.md`.
- Added `/Users/shark/Projects/AIGF/.agent/quality-rules.md`.

## Notes

- AIBF/AIGF updates were applied directly because the user explicitly scoped those local projects as lightweight and not requiring a formal migration flow.
- Application runtime code was not changed.
- Developer metadata was not changed.

## Known Risks

- AIBF and AIGF now have local uncommitted harness-doc changes outside the SharkBay repository.
