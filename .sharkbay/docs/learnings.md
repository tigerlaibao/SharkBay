# Learnings

Record durable lessons here. Newest entries go first.

### Packaged Electron Apps Cannot Rely On Dev Paths Or CWD

**Problem**: The packaged macOS app first showed a blank white screen, then project detail diagnostics reported `ENOENT: no such file or directory, open '/templates/harness/AGENTS.md'`.

**Cause**: Vite emitted absolute `/assets/...` renderer URLs that fail under Electron `file://` loading. Separately, project detail reads did not propagate the packaged `runtime.templateRoot`, so Finder-launched apps could fall back to `process.cwd()` and resolve templates as `/templates/harness`.

**Solution**: Use Vite `base: "./"` for packaged renderer assets, and pass `runtime.templateRoot` through the `readProjectDetail` runtime overload.

**Source**: `.sharkbay/tasks/t-049-packaged-app-blank-screen/implementation.md`, `vite.config.ts`, `src/main/harness-reader.ts`.

---

### Hidden Terminal Surfaces Can Report Invalid Fit Dimensions

**Problem**: Entering Settings could show `Error invoking remote method 'terminal:resize': Error: resizing must be done using positive cols and rows`.

**Cause**: The dashboard remains mounted while Settings is visible, so terminal fit/resize work can race against hidden or unmeasured xterm surfaces and produce invalid dimensions such as `0` or `NaN`.

**Solution**: Validate xterm proposed dimensions before sending renderer resize IPC, and make the terminal backend ignore invalid resize payloads before calling `node-pty`.

**Source**: `.sharkbay/tasks/t-041-settings-terminal-resize-guard/implementation.md`, `src/renderer/App.tsx`, `src/main/terminal.ts`.

---

### Project Status Needs Three Separate Signals

**Problem**: Project rows could show `done` for AIBF/AIGF but show no status for ItsMyLife/SharkBay even though all four were managed projects with completed work.

**Cause**: The UI treated `activeTask.phase` as the project status. That collapsed queue state, last completed task fallback, runner execution state, and human waiting state into one field.

**Solution**: Derive a normalized `taskStatus` from visible queue sections (`active`, actionable `backlog`, `done`, `idle`, `unknown`), keep runner lifecycle from `runner.json` separate, and show Needs Action only for explicit human-intervention or runner-registration problems.

**Source**: `tasks/t-040-project-status-model/implementation.md`, `src/main/harness-reader.ts`, `src/renderer/workflow.ts`, `src/renderer/App.tsx`.

---

### Setup Seeds Are Not Always Setup Blockers

**Problem**: Existing-directory Ripple setup failed when the target project already had a root `.gitignore`.

**Cause**: The setup installer treated every template file collision as fatal, even though `.gitignore` had already been classified as project-owned after setup and the UI promised existing files would not be overwritten.

**Solution**: Keep the no-overwrite preflight for harness and documentation files, but skip the root `.gitignore` seed when it already exists during confirmed existing-directory setup.

**Source**: `tasks/t-034-skip-existing-gitignore-setup/implementation.md`, `src/main/template-installer.ts`, `tests/template-installer.test.ts`.

---

### Backlog Tasks May Be Queue-Only

**Problem**: AIGF backlog task `t-008-conversion-measurement-and-admin` opened to a task detail page that said no detail was found, even though the task list showed a title.

**Cause**: The task existed only in `.agent/queue.json`; no `tasks/<task-id>/` artifact directory had been created yet. SharkBay's drilldown rendered only artifact markdown and ignored queue metadata.

**Solution**: Treat missing task artifacts as normal empty values, and render queue metadata such as phase, status, priority, dependencies, and notes as the fallback task detail.

**Source**: `tasks/t-031-backlog-task-metadata-detail/implementation.md`, `src/renderer/App.tsx`, `src/main/harness-reader.ts`.

---

### Backend Sync Signals Need A Product Surface

**Problem**: Restarting SharkBay showed no visible prompt even though harness template drift checking had been implemented.

**Cause**: The first sync slice exposed scan data and IPC functions, but no renderer surface consumed the drift status or offered an action.

**Solution**: Treat scan-visible state as incomplete until a user-facing row/detail indicator and explicit action exist for the workflow.

**Source**: `tasks/t-029-harness-template-sync-ui/implementation.md`, `src/renderer/App.tsx`.

---

### Harness Template Sync Needs File Ownership Classes

**Problem**: SharkBay's tracked `templates/harness/` files can change after other projects have installed Ripple files, but blindly copying the latest template over every installed file would overwrite project identity, task history, and local decisions.

**Cause**: The starter template seeds both durable control rules and project-owned runtime/history files, but after setup those files no longer have the same ownership model.

**Solution**: Classify `AGENTS.md`, `.agent/protocol.md`, and `.agent/quality-rules.md` as version-owned control files; compute sync status from their content hashes; update only that allowlist; keep manifest, state, queue, `.gitignore`, docs, and tasks project-owned.

**Source**: `tasks/t-028-harness-template-sync/implementation.md`, `src/main/harness-template-sync.ts`.

---

### Terminal Title Capture Must Treat App Input As App Input

**Problem**: A terminal tab initially showed `codex`, then changed to `10;rgb:d9d9/e5e5/dfdf...` after using Codex.

**Cause**: xterm color query responses use OSC control sequences such as `ESC ] 10 ; rgb:... BEL`, but SharkBay's input tracker only skipped CSI sequences. The same tracker also kept treating text submitted inside interactive foreground apps as shell commands.

**Solution**: Skip OSC input sequences and preserve foreground process titles for interactive apps such as `codex`, `claude`, and terminal monitors instead of letting internal input overwrite the tab title.

**Source**: `tasks/t-023-terminal-title-strategy/implementation.md`, `src/main/terminal.ts`, `tests/terminal.test.ts`.

---

### Terminal Titles Need Runtime State

**Problem**: Terminal tabs named after the project did not help distinguish tabs once multiple shells were open for the same repository.

**Cause**: The tab title was assigned only at session creation and never updated from shell cwd or foreground process state.

**Solution**: Derive titles from runtime terminal state: project-relative cwd for idle shells, and foreground command/process titles for occupying apps. Push title changes through a dedicated terminal update event.

**Source**: `tasks/t-023-terminal-title-strategy/implementation.md`, `src/main/terminal.ts`, `src/renderer/App.tsx`.

---

### Runner Claims Need Registered Tasks

**Problem**: An agent could be running for several minutes while SharkBay still showed no started task, or no visible task at all.

**Cause**: Runner lifecycle state was separate from task phase, but the protocol did not require task registration before `runner.status=running`, and SharkBay did not diagnose runner tasks missing from Active queue/currentTask.

**Solution**: Require task registration before runner claim, and have SharkBay annotate live runner tasks as `missing`, `inactive`, or `mismatched` when queue/state/task files do not agree.

**Source**: `tasks/t-022-runner-task-registration/implementation.md`, `.agent/protocol.md`, `src/main/harness-reader.ts`, `src/renderer/workflow.ts`.

---

### Behavioral Discipline Belongs In Gates

**Problem**: Lightweight agent behavior guidance such as clarifying ambiguity, keeping diffs simple, and mapping goals to verification can be forgotten when it lives only in chat or an external instruction file.

**Cause**: The harness already had phase gates and evidence rules, but the behavioral guidance was not explicitly attached to spec, contract, code review, and verification checkpoints.

**Solution**: Put behavioral discipline directly into `AGENTS.md`, `.agent/protocol.md`, `.agent/quality-rules.md`, and setup templates so current and future projects inherit the same reviewable rules.

**Source**: `tasks/t-021-harness-behavioral-discipline/implementation.md`, `.agent/protocol.md`, `templates/harness/.agent/protocol.md`.

---

### Hide Tab Panels Instead Of Unmounting

**Problem**: Switching right detail tabs could discard tab-local state such as a generated handoff prompt or unsaved URL edits.

**Cause**: The first card-tab implementation conditionally rendered only the active tab panel, so inactive tab content unmounted on every switch.

**Solution**: Keep all tab panels mounted and hide inactive panels with the `hidden` attribute plus a CSS rule. Wire tabs to panels with ARIA ids and keyboard navigation.

**Source**: `tasks/t-020-right-detail-card-tabs/implementation.md`, `src/renderer/App.tsx`.

---

### Hide Stateful Workspaces Instead Of Unmounting

**Problem**: Opening Settings and returning to the workbench made previously opened terminal tabs disappear.

**Cause**: Settings navigation conditionally unmounted `DashboardView`, which also destroyed `TerminalPane` local state and renderer-owned xterm instances.

**Solution**: Keep the dashboard mounted in a hidden view surface while Settings is visible, and pass a visibility flag to xterm surfaces so they refit when shown again.

**Source**: `tasks/t-019-preserve-terminals-across-settings/implementation.md`, `src/renderer/App.tsx`.

---

### Node PTY Needs Permission and Lockfile Hygiene

**Problem**: Installing `node-pty` first failed with npm `Invalid Version:` and then PTY spawning failed with `posix_spawnp failed`.

**Cause**: The existing lockfile had old optional dependency package entries without versions, which npm 11 could not dedupe. After install, the macOS `node-pty` `spawn-helper` file lacked executable permissions.

**Solution**: Remove invalid optional lockfile entries so npm regenerates a valid lock, add `scripts/fix-node-pty-permissions.mjs`, and run it before and after Electron native rebuild.

**Source**: `tasks/t-015-xterm-node-pty-terminal-spaces/implementation.md`, `package-lock.json`, `scripts/fix-node-pty-permissions.mjs`.

---

### Terminal Tabs Belong To Project Spaces

**Problem**: A global terminal tab list made project switching create/focus tabs across unrelated projects.

**Cause**: The first terminal slice keyed tabs by cwd/session globally instead of modeling the user's mental model: each project owns its own terminal workspace.

**Solution**: Keep terminal spaces keyed by project candidate id, keep all spaces mounted but only the selected project visible, and create tabs only inside the active project's space.

**Source**: `tasks/t-015-xterm-node-pty-terminal-spaces/implementation.md`, `src/renderer/App.tsx`.

---

### Terminal CWD Is Runtime Authority

**Problem**: A project terminal needs to run arbitrary user commands, but renderer-selected paths are not trustworthy filesystem authority.

**Cause**: Terminal tabs are more powerful than read-only dashboard views because spawned shells can mutate repositories and run services.

**Solution**: Keep terminal spawning in the Electron main process, load configured roots from runtime config, resolve the cwd with `resolveRepoPath`, and reject paths outside configured roots before creating the child process.

**Source**: `tasks/t-014-terminal-integration/implementation.md`, `src/main/terminal.ts`, `tests/terminal.test.ts`.

---

### Do Not Wrap Piped Electron Shells With macOS `script`

**Problem**: Terminal tabs exited immediately with `script: tcgetattr/ioctl: Operation not supported on socket`.

**Cause**: `/usr/bin/script` expects a real terminal device. SharkBay's first terminal slice spawns child processes with piped stdio, so `script` cannot perform terminal ioctls and exits before the shell is usable.

**Solution**: Spawn the user's shell directly for the lightweight terminal surface, and reserve full PTY behavior for a later `node-pty`/xterm-style integration.

**Source**: `tasks/t-014-terminal-integration/implementation.md`, `src/main/terminal.ts`, `tests/terminal.test.ts`.

---

### Piped zsh Must Not Start Interactive Session Restore

**Problem**: Terminal tabs launched zsh, printed a restored-session banner, then exited with `zsh: error on TTY read: Input/output error`.

**Cause**: Starting zsh with interactive flags under Electron's piped child-process stdio allows macOS shell session restore hooks to attempt TTY reads. There is no real TTY in the lightweight terminal path.

**Solution**: Start the shell as a non-interactive login shell, remove the `-i` flag, and set `SHELL_SESSIONS_DISABLE=1` plus `TERM_PROGRAM=SharkBay` for terminal child processes.

**Source**: `tasks/t-014-terminal-integration/implementation.md`, `src/main/terminal.ts`, `tests/terminal.test.ts`.

---

### Queue Sections Have Different Shapes

**Problem**: SharkBay showed only one task for AIGF even though `.agent/queue.json` contained backlog and done entries and `tasks/` had task folders.

**Cause**: The reader treated every queue section as if it used the Active task shape with `phase` and `status`. The harness queue rules allow Backlog and Done to use different fields, such as `notes` and `completed`.

**Solution**: Normalize queue entries by section: Active requires explicit workflow state, Backlog defaults to `backlog`, Done defaults to `done`, and safe task directories are added as read-only fallback rows when the queue omits them.

**Source**: `tasks/t-012-task-directory-queue-fallback/implementation.md`, `src/main/harness-reader.ts`, `src/shared/schema.ts`.

---

### Task Phase Is Not Runner State

**Problem**: SharkBay showed handoff or Needs Action prompts by inferring whether an agent was working from task phases like `spec`, `design_review`, or `coding`.

**Cause**: The harness engineering lifecycle and the physical agent execution lifecycle were collapsed into one signal, so the app could not distinguish "this task is in design review" from "an agent is actually running" or "the user must intervene".

**Solution**: Keep task phase in queue/state artifacts and publish physical runner state separately in local `.agent/runner.json`; SharkBay reads runner status and heartbeat to derive `running`, `stale`, `blocked`, or `waiting_for_human`.

**Source**: `tasks/t-011-runner-lifecycle-heartbeat/implementation.md`, `.agent/protocol.md`, `src/main/harness-reader.ts`, `src/renderer/workflow.ts`.

---

### Template Instructions Must Reference Installed Files

**Problem**: A draft root `AGENTS.md` template referenced a quality-rules file that is present in SharkBay's own harness but not installed by the bundled starter template.

**Cause**: The repository harness and the starter harness template are similar but not identical, so copying local instructions too literally can point new projects at missing files.

**Solution**: Keep template onboarding instructions focused on files the template actually installs, plus active task artifacts and the protocol as the source of truth.

**Source**: `tasks/t-010-agent-onboarding-instructions/implementation.md`, `templates/harness/AGENTS.md`.

---

### Task Directory Is Not the Product Queue

**Problem**: A task folder existed under `tasks/`, but SharkBay did not show it until `.agent/queue.json` and `.agent/state.json` were updated.

**Cause**: SharkBay intentionally reads the machine-readable queue/state mirrors for product data; the `tasks/` directory stores task artifacts and is not scanned as the queue source.

**Solution**: Keep task artifacts and queue/state mirrors synchronized, and treat mismatches as a future sync diagnostic rather than expecting users to understand the distinction.

**Source**: `tasks/t-009-human-intervention-policy/implementation.md`, `.agent/queue.json`, `.agent/state.json`.

---

### Electron Preload ESM Needs the Module Extension

**Problem**: The Electron window rendered the React app, but the renderer never received `window.sharkBay`, so first-run scan/root actions were blocked.

**Cause**: The preload source was `preload.ts`, which TypeScript emitted as `preload.js`. Electron does not infer ESM preload loading from the package `"type": "module"` field alone.

**Solution**: Rename the preload source to `preload.mts`, include `.mts` in node compilation, and point BrowserWindow at the emitted `preload.mjs`.

**Source**: `tasks/t-003-dogfood-self-hosting-flow/implementation.md`, `electron/main.ts`, `electron/preload.mts`, [Electron ESM docs](https://www.electronjs.org/docs/latest/tutorial/esm).

---

### UI Metadata Must Match IPC Shape

**Problem**: The self-hosting dashboard UI expected scan root/error metadata, but the live Electron scan IPC originally returned only project summaries.

**Cause**: The renderer normalized both rich scan results and bare arrays, while the main-process runtime path discarded root scan metadata.

**Solution**: Runtime scan now returns the full `ScanProjectsResult`, and review/tests check that workflow metadata can reach the real dashboard path.

**Source**: `tasks/t-002-self-hosting-ux/code-review.md`, `src/main/scanner.ts`, `electron/ipc.ts`, `electron/preload.ts`.

---

### Runtime Roots Are Authority

**Problem**: The first code review found that IPC-facing services accepted renderer-supplied `configuredRoots`, which could let a renderer payload scan, write, or create outside the app's persisted roots.

**Cause**: Test-friendly service inputs were also exposed on runtime entry points, so caller-provided roots accidentally became an authority boundary.

**Solution**: Runtime services now load configured roots from persisted app config and ignore renderer-supplied roots. Tests cover scan, URL write, and create-repo bypass attempts.

**Source**: `tasks/t-001-sharkbay-mvp-spec/code-review.md`, `src/main/scanner.ts`, `src/main/harness-writer.ts`, `src/main/template-installer.ts`.

---

### Symlinks Need Explicit Rejection

**Problem**: Detail reads and create-repo writes could follow symlinks out of a configured root.

**Cause**: Some paths were joined and accessed directly instead of being checked with `lstat`, `realpath`, and configured-root containment.

**Solution**: Harness JSON reads, task artifact reads, and create targets now reject symlink escapes and use canonical containment checks.

**Source**: `tasks/t-001-sharkbay-mvp-spec/code-review.md`, `src/main/path-safety.ts`, `src/main/harness-reader.ts`, `src/main/template-installer.ts`.

---

Use this format:

```markdown
### Short Title

**Problem**: What happened.

**Cause**: Why it happened.

**Solution**: What fixed it.

**Source**: Task, PR, command, or file reference.

---
```

Record:

- Issues that required research.
- Bugs that took multiple attempts.
- Platform or framework constraints.
- Repeated review findings that should become rules.

Do not record:

- Simple typos.
- Obvious syntax errors.
- One-off trivial fixes.
