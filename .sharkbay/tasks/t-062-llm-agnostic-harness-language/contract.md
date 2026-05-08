# Contract

## Goal

Make the bundled Ripple harness and current SharkBay project guidance agent-neutral so any approved agent or tool can follow the same file-based protocol without reading the harness as owned by one runtime.

## Done Criteria

| Criterion | Verification |
| --- | --- |
| `AGENTS.md` and `templates/harness/AGENTS.md` no longer use legacy tool-oriented positioning. | Search across active instructions, templates, manifests, and docs returns no current tool-specific positioning matches. |
| Protocol and manifest identity are neutral. | Review `.sharkbay/protocol.md`, `templates/harness/.sharkbay/protocol.md`, `.sharkbay/manifest.json`, and `templates/harness/.sharkbay/manifest.json`. |
| Product and UI copy no longer presents SharkBay as tied to one specific agent/tool family. | Search across README, package metadata, bootstrap docs, current harness docs, renderer copy, templates, and entrypoint instructions returns no current positioning matches. |
| Historical process-name support remains intact. | `npm test -- tests/terminal.test.ts` passes. |

## Non-Goals

- Remove terminal support for recognizing interactive agent process names.
- Rewrite old completed task artifacts solely to sanitize historical evidence.
- Add support for additional agent-specific instruction filenames.

## Files Expected To Change

- `AGENTS.md`
- `templates/harness/AGENTS.md`
- `.sharkbay/protocol.md`
- `templates/harness/.sharkbay/protocol.md`
- `.sharkbay/manifest.json`
- `templates/harness/.sharkbay/manifest.json`
- `.sharkbay/docs/product.md`
- `.sharkbay/docs/architecture.md`
- `README.md`
- `package.json`
- `init.md`
- `src/renderer/App.tsx`
- Harness queue/state/task artifacts for this task
