# Implementation Contract

## 1. Objective

Hide SharkBay's visible native macOS title bar while preserving native window controls and existing app behavior.

## 2. In Scope

- Add the Electron window option needed to hide the title bar.
- Keep all current main-window behavior intact.
- Record implementation and verification evidence.

## 3. Out of Scope

- Custom title bars or drag regions.
- Renderer layout changes.
- Release, deployment, or packaging.

## 4. Files Allowed to Change

| Path | Reason |
| --- | --- |
| `electron/main.ts` | Configure the main BrowserWindow chrome. |
| `tasks/t-035-native-titlebar-removal/*` | Task artifacts and evidence. |
| `.agent/queue.json` | Register and complete active task. |
| `.agent/queue.md` | Human-readable queue sync. |
| `.agent/state.json` | Current task and decision sync. |
| `.agent/state.md` | Human-readable state sync. |
| `.agent/runner.json` | Physical runner status. |
| `docs/task.md` | Durable task summary. |
| `docs/learnings.md` | Add a lesson only if verification reveals durable behavior. |

## 5. Done Criteria

- The main Electron window is configured with hidden native title bar behavior.
- Standard macOS window controls remain native.
- TypeScript/build checks pass.
- The task is marked done with verification evidence.

## 6. Required Checks

| Check | Command | Required |
| --- | --- | --- |
| TypeScript | `npm run typecheck` | yes |
| Build | `npm run build` | yes |
| Diff hygiene | `git diff --check` | yes |

## 7. Cross-Validation Requirement

| Critical Behavior | Test/Script | Evidence Expected |
| --- | --- | --- |
| BrowserWindow option remains valid | `npm run typecheck` | TypeScript accepts `titleBarStyle: "hiddenInset"`. |
| App still builds | `npm run build` | Electron and renderer build complete. |

## 8. Stop Conditions

Stop and ask the user if:

- Hiding the title bar requires replacing native macOS controls with custom controls.
- Required checks cannot run.
- The change causes renderer layout overlap that requires a larger UI redesign.
