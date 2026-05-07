# Design Review

## Summary

Second design review after revision.

The revised design now satisfies the design gate. It covers scope, non-goals, data/API/UI implications, risks, edge cases, and a verification approach. The previous major finding about safe `.agent/*.json` writes has been resolved with a constrained harness writer, typed patch inputs, configured-root containment checks, revision tokens, read-modify-write preservation, schema validation, and atomic write behavior.

The previous URL persistence and safety verification minor findings are also resolved. URL state now has an explicit source of truth in `.agent/state.json`, manifest fallback behavior, update validation, conflict behavior, and UI disabling behavior for protocol-fallback repos. The verification plan now includes path containment, ignored paths, non-empty create target refusal, safe JSON write success/failure cases, preservation of unknown fields, URL persistence, stale-write refusal, and visual self-hosting checks.

## Findings

| Severity | Finding | Required Change |
| --- | --- | --- |
| none | No blocker, major, or minor findings in the revised design. | None. |

## Previous Findings Check

| Previous Finding | Result | Evidence |
| --- | --- | --- |
| Major: P0 machine-readable state maintenance was missing and contradicted by read-only existing repos. | resolved | Design now defines `src/main/harness-writer.ts`, write IPC methods, typed patches, allowlisted JSON pointer paths, canonical path containment, exact harness file targeting, revision-token conflict detection, schema validation, atomic temp-file rename, fsync behavior, post-write re-read, and preservation rules for unknown user-authored fields. |
| Minor: URL tracking had no persistence source. | resolved | Design now makes `.agent/state.json` authoritative for `project.localUrl`, `project.testUrl`, and `project.deploymentUrl`, defines manifest compatibility fallback, null normalization for missing/empty/`unknown` values, URL update validation, stale-write handling, and protocol-fallback edit restrictions. |
| Minor: Verification plan did not test high-risk safety behavior. | resolved | Verification plan now includes unit tests for canonical path containment, sibling-prefix paths, traversal, symlink escapes, scanner ignores, non-empty create target refusal, harness writer safe updates, stale revisions, invalid JSON, unsupported patch paths, schema validation failures, symlinked harness files, concurrent changes, unknown-key preservation, URL persistence, and visual/manual app checks with evidence. |

## Gate Result

| Severity | Count |
| --- | --- |
| blocker | 0 |
| major | 0 |
| minor | 0 |
| note | 0 |

## Decision

- [x] Pass
- [ ] Revise
