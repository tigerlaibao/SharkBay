# Verification

## Commands

| Command | Exit | Evidence |
| --- | ---: | --- |
| `npm run typecheck` | 0 | Renderer and Node TypeScript projects completed successfully. |
| `npm run build` | 0 | Vite built 37 modules and emitted renderer assets; existing chunk-size warning only. |
| `git diff --check` | 0 | No whitespace errors reported. |

## Done Criteria

- Long service pill labels are constrained to a max width.
- Service pill labels truncate with ellipsis.
- Full label/command remains available in the existing title attribute.
