# Implementation

## Summary

- Refreshed `README.md` to describe the current SharkBay workbench: runner lifecycle, right-side detail tabs, per-project xterm/node-pty terminal spaces, resizable columns, and Settings-safe terminal persistence.
- Added README setup guidance for native terminal module rebuilds.
- Registered this small ad hoc task in queue/state/runner metadata before editing, per repository protocol.

## Files Changed

- `README.md`
- `.agent/queue.json`
- `.agent/queue.md`
- `.agent/state.json`
- `.agent/state.md`
- `.agent/runner.json`
- `tasks/t-025-readme-publish/status.md`
- `tasks/t-025-readme-publish/contract.md`
- `tasks/t-025-readme-publish/implementation.md`

## Traceability

- User goal: update `README.md`, then push.
- Contract: README documents current product capabilities and native terminal rebuild guidance.
- Protocol: task registration happened before runner claim.

## Checks Run

```text
git diff --check
exit 0
```

```text
jq empty .agent/manifest.json .agent/state.json .agent/queue.json .agent/runner.json
exit 0
```

## Known Risks

- README verification is source review rather than an automated documentation test.
