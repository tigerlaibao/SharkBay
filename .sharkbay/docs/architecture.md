# Architecture

## 1. Overview

SharkBay is a local-first macOS application with a web-style UI and a local process that can scan configured project roots. The local process reads harness metadata from repositories and exposes normalized project/task state to the UI.

This repository is the SharkBay product codebase and can be dogfooded as a harness-enabled project locally. The public repository does not track its root `.agent/`, root `tasks/`, `docs/task.md`, or `docs/learnings.md` runtime/history files; those are local state. The self-hosting constraint remains intentional: when a local harness exists, the app should scan this repo, read its harness manifest, task queue, current phase, and evidence files, then present them exactly as it would for any other configured project.

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
  +--> Project icon resolver
  |
  +--> Template installer
  |
  +--> Harness template sync checker
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
│       ├── AGENTS.md
│       └── .sharkbay/
├── tests/
├── docs/
├── .agent/        # local dogfood state, ignored in public Git
└── tasks/         # local dogfood task history, ignored in public Git
```

## 4. Module Boundaries

| Module | Responsibility | Must Not Do |
| --- | --- | --- |
| Scanner | Discover harness repos under configured roots | Modify repositories |
| Repo reader | Parse contained `.sharkbay/` or legacy `.agent`/root task files | Infer missing facts without marking uncertainty |
| Project icon resolver | Return ordered, read-only icon candidates from safe local app icons and project-authored URLs | Crawl arbitrary websites, write icon caches, or expose raw filesystem paths to the renderer |
| Harness writer | Safely update allowlisted harness JSON fields in the resolved layout | Trust renderer roots, overwrite whole files, follow symlinks outside configured roots |
| Path safety | Canonicalize paths, enforce configured-root containment, reject symlink escapes | Use string-prefix checks as an authority boundary |
| Template installer | Create new harness repos from templates | Overwrite existing files blindly |
| Harness template sync | Compare/update version-owned Ripple control files from tracked `templates/harness/` | Overwrite project-owned identity, queue, state, docs, tasks, or runtime history |
| Application menu | Expose macOS-native app actions such as Settings | Perform repository reads or writes directly |
| Dashboard UI | Display project and task lifecycle state | Execute destructive repo operations |
| Prompt generator | Produce next-action prompts for agents or tools | Pretend execution happened |
| Terminal manager | Spawn user-driven `node-pty` shell tabs inside configured project roots | Treat renderer-supplied cwd as filesystem authority or run outside configured roots |
| Runner, future | Invoke approved agents or tools with approval | Run without logs or user-visible evidence |

## 5. Self-Hosting Requirement

The first real repository SharkBay manages in a development workspace may be this SharkBay repository. In public clones, local harness state is optional and ignored; the tracked harness source for newly managed projects is `templates/harness/`.

Acceptance criteria:

- A configured root that contains `<repo-root>` can discover this repo after a local harness is present.
- The repo appears as project `SharkBay`.
- The active task appears according to the local harness state and queue files.
- The phase is read from the current local harness state on disk.
- The app treats this repo like any other managed harness project, not as a hard-coded special case.

## 6. Data Flow

```text
Configured project roots
  -> scanner finds candidate repos
  -> repo reader loads manifest, state, queue, and task artifacts from the resolved harness layout
  -> icon resolver adds local icon data URLs and favicon candidates
  -> normalized project records
  -> dashboard list, detail views, and terminal cwd selection
  -> user selects project/task action
  -> prompt generator, template installer, or terminal session manager handles the action
```

## 7. Safety Model

Runtime IPC/service entry points load configured roots from SharkBay's persisted app config. Renderer payloads may identify a project or desired action, but they are not trusted to redefine filesystem authority.

The scan IPC returns the full `ScanProjectsResult`, including root availability metadata and project summaries, so the renderer can show unavailable roots and scan diagnostics without gaining filesystem authority.

Existing managed repositories are writable only through narrow harness JSON patches:

- Supported logical files: manifest, state, and queue JSON in the resolved harness layout.
- Required protections: configured-root containment, symlink rejection, revision-token conflict detection, schema validation, unknown-field preservation, stable JSON serialization, and atomic writes.
- URL source of truth: harness state JSON under `project.localUrl`, `project.testUrl`, and `project.deploymentUrl`.

Harness template sync has a separate allowlist for version-owned control files:

- `AGENTS.md`
- protocol markdown in the resolved harness layout
- quality rules markdown in the resolved harness layout

The sync checker computes a content-hash version from those tracked template files, records new install metadata in harness `template-sync.json`, and exposes current/stale/missing status through project scan/detail data. It does not overwrite project-owned files such as manifest, state, queue, development metadata, `.gitignore`, docs, or tasks. Setup does not own or rewrite project ignore rules.

Legacy harness cleanup is a separate explicit migration service. It reports readiness during project detail reads, but only writes after a confirmed IPC action. The migration refuses mixed `.agent` plus `.sharkbay` layouts, symlinked sources, destination conflicts, and unsafe task directory names. It moves only known harness files from `.agent`, known root docs, `_template`, and task directories with `status.md`; root `AGENTS.md`, `.gitignore`, and unrelated root `docs`/`tasks` entries stay in place.

Create-repo writes only to an empty target inside configured roots and rejects non-empty targets, existing harness files, and symlink targets.

Terminal sessions are writable process sessions, but their filesystem authority starts from the same configured-root boundary. The main process canonicalizes the requested cwd through `resolveRepoPath` before spawning a `node-pty` shell, and renderer payloads cannot open arbitrary paths outside configured roots. The renderer uses xterm terminal spaces keyed by project candidate so hidden project terminals remain alive while only the selected project's space is visible.

## 8. Constraints

| Constraint | Reason | Source |
| --- | --- | --- |
| Prefer JSON for dashboard state | Markdown tables are fragile to parse | Harness protocol |
| Manage only configured roots | User wants all repository work constrained by explicit directory settings | User answer |
| Preserve repository files | SharkBay manages developer workspaces, including its own source repo | Safety rule |
| Require evidence for verification | Avoid self-reporting without proof | Quality rules |
| Ask before direct execution | Agent/tool invocation can edit files or run commands | Approval rule |
