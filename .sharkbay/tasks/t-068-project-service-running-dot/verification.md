# Verification

## Commands

| Command | Exit | Evidence |
| --- | ---: | --- |
| `npm run typecheck` | 0 | Renderer and Node TypeScript projects completed successfully. |
| `npm run build` | 0 | Vite built 37 modules and emitted renderer assets; existing chunk-size warning only. |
| `git diff --check` | 0 | No whitespace errors reported. |

## Done Criteria

- Projects with running service-bound tabs have a green dot before the project name.
- The dot is based on live terminal service state.
- No service command or process behavior changed.
