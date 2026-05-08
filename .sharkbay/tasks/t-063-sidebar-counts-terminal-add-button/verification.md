# Verification

## Commands

| Command | Exit | Evidence |
| --- | ---: | --- |
| `npm run typecheck` | 0 | `tsc -p tsconfig.renderer.json --noEmit && tsc -p tsconfig.node.json --noEmit` completed successfully. |
| `npm run build` | 0 | Vite built 37 modules and emitted `dist/renderer`; existing chunk-size warning only. |
| `git diff --check` | 0 | No whitespace errors reported. |
| `jq empty .sharkbay/state.json .sharkbay/queue.json .sharkbay/runner.json` | 0 | Harness JSON parsed successfully. |

## Done Criteria

- Managed/Not setup counts removed: verified by diff removing the `ProjectTable` count `<span>`.
- Terminal `+` moved into tabs row and right aligned: verified by diff adding `.terminal-tab-add` inside `.terminal-tabs` with `margin-left: auto`.
- Existing terminal creation behavior preserved: verified by retaining the existing button handler and disabled condition.

## Residual Risk

- No automated screenshot was captured in this slice; verification is compile/build/diff based.
