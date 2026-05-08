# Product

## 1. Background and Terms

SharkBay is a macOS local app for managing harness-enabled software projects. It starts with local projects that have SharkBay's Ripple files installed: a file-based project memory and task protocol under contained `.sharkbay/` harness files, with legacy support for older `.agent/`, root `docs/`, and root `tasks/` projects. The project exists because switching between many sessions and repositories makes it hard to see what each project is doing, what phase each task is in, and what evidence exists for review or verification.

SharkBay can also manage this repository locally during dogfooding. That local root `.agent/`, root `tasks/`, `docs/task.md`, and `docs/learnings.md` state is intentionally not tracked in the public product repository so forks do not inherit SharkBay's private work queue or run history. The public source of the harness that SharkBay installs into other projects is `templates/harness/`.

Key terms:

| Term | Meaning |
| --- | --- |
| Managed project | A local project SharkBay can read and display |
| Ripple files | SharkBay's `.sharkbay/` project memory files, plus legacy `.agent`/root docs/root tasks compatibility |
| Scan root | A local parent directory SharkBay scans for managed projects |
| Phase | The current lifecycle step for a task, such as `spec`, `design`, `coding`, or `verification` |
| Gate | A quality condition required before a task can advance |
| Evidence | Logs, command output, screenshots, traces, or scripts proving verification happened |

## 2. Product Summary

| Item | Value |
| --- | --- |
| One-line positioning | A macOS workbench for local harness-enabled projects |
| Target users | Developers managing multiple local repos that follow file-based task protocols |
| Core workflow | Scan user-configured roots, inspect managed project/task state, create new managed projects, and generate next-action prompts |
| Value proposition | Reduce session switching by making project state, phase, gates, URLs, and verification evidence visible in one place |
| First managed project | SharkBay itself |

## 3. User Problems

| User | Problem | Current workaround | Desired outcome |
| --- | --- | --- | --- |
| Solo developer | Too many sessions and repos to track mentally | Manually switch windows and read logs | One dashboard shows project/task state |
| Solo developer | Work is marked done without durable evidence | Search terminal history and notes | Verification evidence is saved and visible |
| Solo developer | New project setup repeats the same Ripple file boilerplate | Copy files manually | Create a managed project from templates |
| Solo developer | Unsure what action should happen next | Reconstruct state from memory | Generate a next-action prompt from task state |

## 4. Functional Scope

| Priority | Feature | Description | Acceptance Criteria |
| --- | --- | --- | --- |
| P0 | Project workbench | Make Projects the primary view | User sees managed projects, status, current task, links, and next action before low-frequency settings |
| P0 | Scan root management | Keep directory access in Settings, opened from the macOS app menu | User can add/remove scan roots without the main workbench or left project panel being dominated by setup controls |
| P0 | Project scanning | Scan configured local directories for managed projects | Finds repos with `.sharkbay/manifest.json` or legacy `.agent/manifest.json`; falls back to protocol files |
| P0 | Directory safety boundary | Manage only user-configured directories | App does not scan or modify arbitrary filesystem locations outside configured roots |
| P0 | Project detail | Show queue, active task, lifecycle artifacts, and evidence | User can inspect task files without leaving the app |
| P0 | New managed project wizard | Create a new project directory from bundled templates | Writes root `AGENTS.md` and contained `.sharkbay/` harness files |
| P1 | Next-action prompt | Generate a prompt for an agent or tool to advance a selected task | Prompt references repo path, task id, phase, and protocol |
| P1 | URL tracking | Store local, test, and deployment URLs | URLs appear in project dashboard and detail view |
| P1 | Project icons | Show recognizable project identity icons in the workbench list | Project rows show circular icons from local app icons, favicons, or the bundled default icon |
| P1 | Ordinary folder discovery | Show all direct child folders under scan roots | User can see projects that are not managed yet and start one-click Ripple setup |
| P1 | Project terminal | Open terminal tabs rooted at selected project directories | Selecting any managed or not-setup project opens a shell rooted at that project path |
| P1 | Dev service controls | Start and stop discovered `dev` services from the terminal header | Projects with root `dev`/`dev:*` scripts or direct-child `scripts.dev` show script-labeled pills; starting creates a service log terminal tab and stopping removes it |
| P1 | Harness template sync | Detect when installed Ripple control files drift from SharkBay's tracked `templates/harness/` source | Managed project scan results include current/stale/missing harness template status and stale file names |
| P1 | Legacy harness migration | Move old `.agent`/root docs/root tasks harness files into `.sharkbay/` only after explicit confirmation | Mixed layouts, conflicts, symlinks, and unrelated root content are preserved or blocked rather than changed silently |
| P1 | Harness uninstall | Remove Ripple harness files from a managed project after explicit confirmation | Right-clicking a managed project exposes an uninstall action that removes recognized harness files and only matching `.gitignore` lines |
| P2 | Direct agent/tool invocation | Advance tasks from the UI through an approved agent or tool | Requires explicit user approval and visible logs |

## 5. Non-Goals

- Multi-user collaboration in the first version.
- Cloud sync in the first version.
- Billing, accounts, or permissions.
- Remote code execution.
- Autonomous long-running background execution before the read-only dashboard and prompt generation are stable.

## 6. Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Markdown parsing is brittle | Dashboard may misread state | Use JSON mirrors as primary machine-readable state |
| Harness template refresh overwrites project memory | Managed project state/history could be corrupted | Sync only version-owned control files; never overwrite project-owned queue, state, docs, or tasks |
| Direct agent invocation is risky | Unintended file edits or long-running commands | Start with prompt generation; add execution later behind approval |
| Local filesystem access differs by platform | Scanning may fail | Start on macOS/local paths; isolate filesystem access behind a service |
| Scope expands into a full project management suite | MVP slows down | Keep v0 focused on local managed projects and task lifecycle visibility |
