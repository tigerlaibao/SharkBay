# Architecture

SharkBay is an Electron app with a TypeScript main process, React renderer, preload bridge, and shared IPC contracts.

## Process Model

- `electron/main.ts` creates the main `BrowserWindow`, loads the Vite dev server in development, and loads `dist/renderer/index.html` in packaged builds.
- `electron/preload.mts` exposes the constrained `window.sharkBay` bridge.
- `electron/ipc.ts` registers all main-process IPC handlers and broadcasts runtime events.
- `src/renderer/main.tsx` renders `App` into `index.html`.
- `src/renderer/App.tsx` contains the current UI shell and most renderer components.

The main window runs with context isolation enabled and node integration disabled. The preload bridge is the renderer's only direct path into main-process capabilities.

## IPC Surface

Canonical channel names live in `src/shared/ipc-channels.ts`. The exposed groups are:

- `config:*` - configured projects, scan roots, folder picker, and appearance theme.
- `projects:*` - scan, project detail, and file tree.
- `terminal:*` - PTY lifecycle, input, resize, data, updates, and exits.
- `browser:*` - embedded BrowserView lifecycle, navigation, resize, and updates.
- `agents:*` - available agent CLI list and transcript-derived status events.
- `teamwork:*` - tasks, status, install, enable, uninstall, identity, sync, and task-change events.

Renderer-facing data types are mirrored in `src/renderer/types.ts`; stricter shared contracts live in `src/shared/types.ts`.

## Main-Process Modules

| Module | Responsibility |
| --- | --- |
| `src/main/config.ts` | Load/save normalized app config. |
| `src/main/json-file.ts` | Atomic JSON reads/writes with revisions. |
| `src/main/path-safety.ts` | Resolve configured roots/projects and enforce path containment. |
| `src/main/scanner.ts` | Discover Git repositories and merge manually configured projects. |
| `src/main/git.ts` | Read Git metadata, reflog history, and dirty files. |
| `src/main/project-files.ts` | Return safe lazy file-tree entries and editable-file flags. |
| `src/main/project-icons.ts` | Resolve local project icon candidates and favicon fallbacks. |
| `src/main/dev-services.ts` | Discover runnable development services. |
| `src/main/terminal.ts` | Manage `node-pty` sessions and terminal titles. |
| `src/main/browser-tabs.ts` | Manage embedded Electron `BrowserView` tabs. |
| `src/main/agent-clis.ts` | Discover agent CLIs and watch Codex/Claude transcript status. |
| `src/main/teamwork-*.ts` | Install Teamwork harness, parse tasks, and sync context records. |

## Renderer Structure

The renderer currently uses React hooks rather than a separate state library.

- `App` owns global state: view, configured roots/projects, scan candidates, selected project, detail data, loading/errors, scan time, and theme.
- `DashboardView` builds the three-column workbench: project list, terminal/browser workspace, and detail pane.
- `TerminalPane` owns per-project terminal/browser tab state.
- `ProjectDetailPane` owns `TEAM`, `Git`, and `Files` tabs.
- `SettingsView` owns project, scan-root, status, and appearance settings.
- `src/renderer/workflow.ts` contains pure workflow helpers with focused unit tests.
- `src/styles/app.css` is the single global stylesheet and implements all current themes.

## Runtime Data

- Electron app config: `app.getPath("userData")/config.json`.
- Legacy/helper config default: `~/.sharkbay/config.json` when config helpers are called outside Electron runtime.
- Renderer layout state: `localStorage` keys for project/detail column widths.
- Browser session storage: Electron partition `persist:sharkbay-browser`.
- Teamwork local state: `.sharkbay/`, generated `AGENTS.md`, and `.git/info/exclude` entries in the target repository.
- Teamwork shared state: remote branch `sharkbay-team-context`, mirrored locally under `.sharkbay/team-context/`.
- Agent status sources: recent local files under `~/.codex/sessions` and `~/.claude/projects`.

## Path And Execution Safety

Path safety is enforced in the main process. Renderer-supplied paths are re-resolved against persisted configured projects or roots before filesystem, Git, file-tree, terminal, or Teamwork operations run.

Key boundaries:

- `resolveRepoPath` requires directories to be inside a configured project or configured root.
- file tree listing rejects unsafe directory paths and only marks contained, known text-like files as editable.
- terminal cwd is resolved through the same allowed-project boundary.
- BrowserView navigation accepts only `http:` and `https:` URLs; invalid or unsafe schemes become `about:blank`.
- generated Teamwork adapters are only overwritten when they contain the SharkBay marker.
- Teamwork context cleanup is restricted to the repository owner.

## External Commands

SharkBay shells out to local tools for user-visible project workflows:

- `git` for repository status, history, sync, and Teamwork context transport.
- `gh` for Teamwork identity and repository permission checks.
- `lsof` on macOS for terminal cwd/title inspection.
- `/bin/zsh -lc command -v ...` and fallback paths for CLI discovery.
- user shells through `node-pty` for terminal tabs and service commands.

## Packaging

- The package entry is `dist-electron/electron/main.js`.
- `npm run build` compiles main-process TypeScript and builds the renderer.
- Vite uses `base: "./"` so packaged `file://` renderer assets resolve correctly.
- Electron Builder includes `dist/renderer`, `dist-electron`, `package.json`, and `resources/`.
- `node-pty` is unpacked from ASAR and rebuilt by install/rebuild scripts.

`tsconfig.node.json` currently includes tests in the Node build output. Review packaged contents before release if artifact size or source exposure matters.

## Tests

Vitest tests cover main-process helpers and pure renderer workflow behavior, including scanner, Git parsing, path safety, terminal logic, browser URL normalization, Teamwork harness/sync/tasks, IPC channels, and build config. There is no broad React DOM/component test suite yet.
