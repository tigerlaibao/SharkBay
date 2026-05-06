# Architecture

## 1. Overview

SharkBay is a local-first macOS application with a web-style UI and a local process that can scan configured project roots. The local process reads harness metadata from repositories and exposes normalized project/task state to the UI.

This repository is both the SharkBay product codebase and the first harness-enabled project SharkBay should be able to understand. That self-hosting constraint is intentional: the app should be able to scan this repo, read its `.agent/manifest.json`, task queue, current phase, and evidence files, then present them exactly as it would for any other configured project.

```text
User
  |
  v
macOS App UI
  |
  +--> Application menu opens Settings
  |
  v
Local SharkBay process
  |
  +--> Project root scanner
  |
  +--> Harness repo reader
  |
  +--> Template installer
  |
  +--> Prompt generator
  |
  +--> Terminal session manager
  |
  v
Local filesystem repositories
```

## 2. Tech Stack

| Layer | Technology | Reason |
| --- | --- | --- |
| App shell | Recommended: Electron | Easiest first macOS app path because SharkBay needs Node filesystem access and a desktop shell |
| UI | Recommended: React + TypeScript + Vite | Fast local development with familiar web UI patterns |
| Local service | Electron main process / Node modules | Needs filesystem scanning, git inspection, and template writes |
| Storage | Local JSON/files | Project state already lives inside repos |
| Templates | Repository files | New harness repos are created from versioned templates |

## 3. Directory Structure

```text
.
├── electron/
│   ├── main.ts
│   ├── preload.ts
│   └── ipc.ts
├── src/
│   ├── main/
│   ├── renderer/
│   ├── shared/
│   └── styles/
├── templates/
│   └── harness/
├── tests/
├── docs/
├── .agent/
└── tasks/
```

## 4. Module Boundaries

| Module | Responsibility | Must Not Do |
| --- | --- | --- |
| Scanner | Discover harness repos under configured roots | Modify repositories |
| Repo reader | Parse `.agent/manifest.json`, state, queue, and task files | Infer missing facts without marking uncertainty |
| Harness writer | Safely update allowlisted `.agent/*.json` fields | Trust renderer roots, overwrite whole files, follow symlinks outside configured roots |
| Path safety | Canonicalize paths, enforce configured-root containment, reject symlink escapes | Use string-prefix checks as an authority boundary |
| Template installer | Create new harness repos from templates | Overwrite existing files blindly |
| Application menu | Expose macOS-native app actions such as Settings | Perform repository reads or writes directly |
| Dashboard UI | Display project and task lifecycle state | Execute destructive repo operations |
| Prompt generator | Produce next-action prompts for Codex | Pretend execution happened |
| Terminal manager | Spawn user-driven `node-pty` shell tabs inside configured project roots | Treat renderer-supplied cwd as filesystem authority or run outside configured roots |
| Runner, future | Invoke Codex CLI/MCP with approval | Run without logs or user-visible evidence |

## 5. Self-Hosting Requirement

The first real repository SharkBay manages should be this SharkBay repository.

Acceptance criteria:

- A configured root that contains `<repo-root>` can discover this repo.
- The repo appears as project `SharkBay`.
- The active task appears as `t-001-sharkbay-mvp-spec`.
- The phase is read from the current harness state on disk.
- The app treats this repo like any other managed harness project, not as a hard-coded special case.

## 6. Data Flow

```text
Configured project roots
  -> scanner finds candidate repos
  -> repo reader loads .agent/manifest.json, state, queue, and task artifacts
  -> normalized project records
  -> dashboard list, detail views, and terminal cwd selection
  -> user selects project/task action
  -> prompt generator, template installer, or terminal session manager handles the action
```

## 7. Safety Model

Runtime IPC/service entry points load configured roots from SharkBay's persisted app config. Renderer payloads may identify a project or desired action, but they are not trusted to redefine filesystem authority.

The scan IPC returns the full `ScanProjectsResult`, including root availability metadata and project summaries, so the renderer can show unavailable roots and scan diagnostics without gaining filesystem authority.

Existing managed repositories are writable only through narrow harness JSON patches:

- Supported files: `.agent/manifest.json`, `.agent/state.json`, `.agent/queue.json`.
- Required protections: configured-root containment, symlink rejection, revision-token conflict detection, schema validation, unknown-field preservation, stable JSON serialization, and atomic writes.
- URL source of truth: `.agent/state.json` under `project.localUrl`, `project.testUrl`, and `project.deploymentUrl`.

Create-repo writes only to an empty target inside configured roots and rejects non-empty targets, existing harness files, and symlink targets.

Terminal sessions are writable process sessions, but their filesystem authority starts from the same configured-root boundary. The main process canonicalizes the requested cwd through `resolveRepoPath` before spawning a `node-pty` shell, and renderer payloads cannot open arbitrary paths outside configured roots. The renderer uses xterm terminal spaces keyed by project candidate so hidden project terminals remain alive while only the selected project's space is visible.

## 8. Constraints

| Constraint | Reason | Source |
| --- | --- | --- |
| Prefer JSON for dashboard state | Markdown tables are fragile to parse | Harness protocol |
| Manage only configured roots | User wants Codex and SharkBay constrained by explicit directory settings | User answer |
| Preserve repository files | SharkBay manages developer workspaces, including its own source repo | Safety rule |
| Require evidence for verification | Avoid AI self-reporting without proof | Quality rules |
| Ask before direct execution | Codex invocation can edit files or run commands | Approval rule |
