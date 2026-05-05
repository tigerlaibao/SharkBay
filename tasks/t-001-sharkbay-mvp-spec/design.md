# Design

## 1. Summary

Build SharkBay MVP as a local macOS desktop app using Electron + React + TypeScript + Vite. Electron's main process owns filesystem access, git inspection, harness JSON maintenance, harness repo creation, and prompt generation. The React renderer owns the dashboard, detail view, URL editing, create-repo flow, and copyable next-action prompts.

The first end-to-end proof is self-hosting: when the user configures a root that contains `<repo-root>`, SharkBay must discover this repository, read its `.agent/manifest.json`, `.agent/state.json`, `.agent/queue.json`, and task files, then display the current active task and phase without special-casing this repo.

## 2. Proposed Approach

### Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Desktop shell | Electron | Provides macOS app shell and Node filesystem access. |
| UI | React + TypeScript | Familiar component model for dashboard/detail workflows. |
| Bundler/dev | Vite | Fast local dev server and renderer build. |
| Main process build | TypeScript compiled for Node/Electron | Keeps scanner and repo-reader code typed. |
| Storage | Local JSON config | App config stores configured roots and UI preferences. Project state remains inside each managed repo. |
| Git inspection | Local `git` commands via Node child process | Read-only in MVP: branch, status, remote. |
| Testing | Vitest for scanner/reader/prompt logic | UI/browser checks can be added after app scaffold exists. |

### App Model

SharkBay has two kinds of local data:

| Data | Owner | Location |
| --- | --- | --- |
| App config | SharkBay app | App data directory, with a dev override under the project during local testing |
| Project state | Managed repository | `.agent/manifest.json`, `.agent/state.json`, `.agent/queue.json`, `tasks/<task-id>/...` |

The MVP should not create a central database. It should re-scan configured roots on demand and normalize discovered project records for the UI.

### Main Process Responsibilities

- Load and save app config containing configured project roots.
- Scan configured roots for harness repositories.
- Read harness JSON files and selected task Markdown files.
- Safely update the narrow harness JSON write surface for managed repos.
- Inspect git branch, dirty state, and remote URL.
- Create a new harness repo from bundled templates.
- Generate next-action prompts from selected project/task state.
- Expose narrow IPC methods to the renderer.

### Renderer Responsibilities

- Show a project list dashboard optimized for scanning many repos.
- Show project detail with queue, active task, phase, gate status, review findings, verification evidence, recent decisions, URLs, and prompt actions.
- Let the user add/remove configured roots.
- Let the user edit tracked local, test, and deployment URLs for a managed project.
- Let the user create a harness repo from templates.
- Let the user copy the generated next-action prompt.

### IPC Boundary

Renderer code must not receive arbitrary filesystem powers. It calls explicit IPC methods such as:

| IPC Method | Purpose |
| --- | --- |
| `config:listRoots` | Return configured scan roots. |
| `config:addRoot` | Add a user-selected root. |
| `config:removeRoot` | Remove a configured root. |
| `projects:scan` | Scan configured roots and return normalized project summaries. |
| `projects:getDetail` | Return detailed state for one detected project. |
| `projects:updateUrls` | Update local, test, and deployment URLs in `.agent/state.json` for one managed project. |
| `harness:updateState` | Apply a constrained update to supported fields in `.agent/state.json`. |
| `harness:updateManifest` | Apply a constrained update to supported fields in `.agent/manifest.json`. |
| `harness:updateQueue` | Apply a constrained update to supported fields in `.agent/queue.json`. |
| `projects:createHarnessRepo` | Create a new harness repo in a user-selected directory. |
| `prompts:nextAction` | Generate a copyable Codex prompt for one task. |

All write IPC methods accept a detected `projectId` or canonical repo path plus an `expectedRevision` read token. They do not accept arbitrary output paths or raw file contents from the renderer.

## 3. Files and Modules

| File/Module | Change | Reason |
| --- | --- | --- |
| `package.json` | Add Electron/Vite/React/TypeScript scripts and dependencies | Project scaffold and repeatable commands |
| `tsconfig.json` | Shared TypeScript settings | Type safety for app code |
| `electron/main.ts` | Electron main process entry | Window creation, IPC registration, app lifecycle |
| `electron/preload.ts` | Safe renderer bridge | Expose typed API without Node globals in renderer |
| `src/renderer/` | React UI | Dashboard, detail, settings, create repo, prompt panels |
| `src/shared/types.ts` | Shared data contracts | Project, task, gate, config, and prompt types |
| `src/main/config.ts` | App config loading/saving | Persist configured roots |
| `src/main/scanner.ts` | Discover harness repos | Find `.agent/manifest.json` and fallback `.agent/protocol.md` |
| `src/main/harness-reader.ts` | Read and normalize harness state | Convert repo files into UI records |
| `src/main/harness-writer.ts` | Safely update managed harness JSON | Constrained read-modify-write updates for `.agent/manifest.json`, `.agent/state.json`, and `.agent/queue.json` |
| `src/main/path-safety.ts` | Canonicalize and validate paths | Enforce configured-root containment and prevent symlink/path traversal escapes |
| `src/main/git.ts` | Read-only git metadata | Branch, dirty state, remote origin |
| `src/main/template-installer.ts` | Create harness repos from templates | New repo wizard |
| `src/main/prompt-generator.ts` | Generate next-action prompt | Copyable Codex instructions |
| `templates/harness/` | Bundled harness templates | Source for new harness repos |
| `tests/` | Unit tests for scanner/reader/prompt logic | Verification for critical parsing and generation behavior |
| `docs/architecture.md` | Keep architecture aligned with implementation | Durable project knowledge |
| `docs/task.md` | Track task phase and state | Harness synchronization |

## 4. Data/API/UI Impact

### Normalized Project Summary

```ts
type ProjectSummary = {
  id: string;
  name: string;
  path: string;
  detection: "manifest" | "protocol-fallback";
  repoUrl: string | null;
  currentBranch: string | null;
  dirtyWorktree: boolean | null;
  activeTask: {
    taskId: string;
    title: string;
    phase: string;
    priority: number;
    gateStatus: "pass" | "pending" | "blocked" | "unknown";
  } | null;
  localUrl: string | null;
  testUrl: string | null;
  deploymentUrl: string | null;
};
```

### Project Detail

```ts
type ProjectDetail = ProjectSummary & {
  queue: {
    active: TaskQueueItem[];
    backlog: TaskQueueItem[];
    done: TaskQueueItem[];
  };
  currentTask: {
    statusMarkdown: string | null;
    specMarkdown: string | null;
    designMarkdown: string | null;
    designReviewMarkdown: string | null;
    contractMarkdown: string | null;
    codeReviewMarkdown: string | null;
    verificationMarkdown: string | null;
    decisionsMarkdown: string | null;
  } | null;
  recentDecisions: Array<{
    date: string;
    decision: string;
    source: string;
  }>;
  revisions: {
    manifest: string | null;
    state: string | null;
    queue: string | null;
  };
};
```

### Harness JSON Write Surface

Existing managed repos are not globally writable. The MVP may update only these JSON files and only through `src/main/harness-writer.ts`:

| File | Allowed MVP Updates | Owner Module |
| --- | --- | --- |
| `.agent/manifest.json` | Project identity fields created by SharkBay templates, repository URL/default branch when detected or user-confirmed, and `runtime.localUrl`, `runtime.testUrl`, `runtime.deploymentUrl` as compatibility mirrors only when those keys already exist | `harness-writer` |
| `.agent/state.json` | `updatedAt`, `repository` git mirror fields, `project.currentFocus`, `project.localUrl`, `project.testUrl`, `project.deploymentUrl`, `currentTask` mirror fields, and append-only `recentDecisions` entries created by explicit SharkBay actions | `harness-writer` |
| `.agent/queue.json` | `updatedAt` and task entries inside `active`, `backlog`, and `done` only for explicit task mirror operations. Allowed item fields are `priority`, `taskId`, `title`, `phase`, `dependsOn`, and `status`; unknown item fields are preserved. MVP create-repo initializes the queue, and existing-repo updates must never replace the whole queue object blindly. | `harness-writer` |

The renderer never sends full replacement JSON. It sends typed patches such as `UpdateProjectUrlsInput`, `UpdateGitMirrorInput`, or future `UpdateTaskMirrorInput`. Each patch maps to an allowlist of JSON pointer paths; unknown paths are rejected before reading the target file.

Write behavior:

1. Resolve the repo path with `realpath` and confirm it is inside one configured root. The containment check must use canonical absolute paths and path-segment boundaries, so `<repo-root>-other` is not treated as inside `<repo-root>`.
2. Resolve the target harness file and confirm it is exactly one of `.agent/manifest.json`, `.agent/state.json`, or `.agent/queue.json` under that repo. Symlinks that resolve outside the repo or configured root are rejected.
3. Read the current file, parse JSON, and compute a revision token from file size, mtime, and a content hash.
4. Compare the current revision token to the renderer's `expectedRevision`. If the file changed since the UI loaded it, return a conflict with the latest parsed data and do not write.
5. Apply the typed patch as read-modify-write. Unknown top-level keys and user-authored fields are preserved at the data level by modifying only allowlisted fields in the parsed object.
6. Validate the complete resulting object against the local schema for that file. Required fields, array/object shapes, `schemaVersion`, task queue sections, and URL string/null values must be valid before any write.
7. Serialize with stable two-space JSON formatting and a trailing newline. Formatting may normalize the touched JSON file, but unrelated keys and values must remain present.
8. Write to a temporary sibling file, `fsync` the file, then atomically `rename` it over the target. If supported, `fsync` the parent `.agent` directory after rename.
9. Re-read the written file, parse it, and return the new revision token to the renderer.

Conflict and preservation behavior:

- Invalid existing JSON blocks writes and leaves the file untouched; the detail view shows the parse error.
- Revision mismatches block writes and ask the user to refresh or review the latest state.
- Schema validation failures block writes and show field-level errors.
- Patches must not remove unknown keys, reorder arrays except for explicitly updated queue arrays, or regenerate whole files for existing managed repos.
- SharkBay may initialize all three JSON files during `projects:createHarnessRepo`, but it must not overwrite existing files in an existing repo unless a future explicit migration design approves that behavior.

### URL Persistence

The source of truth for tracked URLs is `.agent/state.json` under `project.localUrl`, `project.testUrl`, and `project.deploymentUrl`.

Read behavior:

- `harness-reader` reads URL values from `.agent/state.json` first.
- Missing values, empty strings, and the legacy string `"unknown"` normalize to `null` in UI types.
- If `.agent/state.json` is missing or invalid, URL fields are `null` and the project detail shows the state-file error.
- `manifest.runtime.localUrl`, `manifest.runtime.testUrl`, and `manifest.runtime.deploymentUrl` are read only as fallback compatibility values when `.agent/state.json` does not provide a usable value.

Update behavior:

- `projects:updateUrls` writes URL changes to `.agent/state.json` through `harness-writer`.
- Accepted values are `null` or URL strings with allowed schemes `http:`, `https:`, or local development schemes explicitly supported by the app. Whitespace-only values become `null`.
- Updating URLs also updates `.agent/state.json.updatedAt` and returns a new state revision token.
- If the manifest already has a `runtime` object with matching URL keys, SharkBay may mirror the same values there in the same safe write transaction for compatibility. The state file remains authoritative when values disagree.
- URL edits are disabled for protocol-fallback repos until `.agent/state.json` exists and validates.

### UI Views

| View | Purpose | Primary Controls |
| --- | --- | --- |
| Dashboard | Compare all detected projects | Scan roots, refresh, filter by phase/dirty/gate, open detail |
| Project Detail | Inspect one harness repo | Queue tabs, artifact viewer, copy next-action prompt |
| Settings | Manage configured roots | Add root, remove root, rescan |
| Create Repo | Create harness repo from templates | Project name/path fields, template preview, create |

The MVP UI should be quiet and information-dense: a sidebar for configured roots/projects, a main project table, and a detail pane. Avoid a marketing-style landing page; the first screen should be the dashboard.

### Safety Model

- The app scans only configured roots.
- Existing managed repos are mutated only through the narrow harness JSON write surface above.
- The create-repo flow writes only into a user-selected target directory and refuses to overwrite non-empty paths unless a later explicit design allows it.
- Direct Codex execution is out of scope. Prompt generation is copy-only.

## 5. Edge Cases

| Case | Handling |
| --- | --- |
| Configured root does not exist | Show root as unavailable and skip scanning it. |
| Root contains many nested repos | Scan with depth and ignore rules; avoid descending into `node_modules`, `.git`, build output, and hidden cache directories. |
| Repo has `.agent/protocol.md` but no manifest | Detect with `protocol-fallback`, mark fields as unknown where JSON is missing. |
| Harness JSON is invalid | Keep project visible with an error state and show the parse error in detail. |
| Queue and task status disagree | Treat `tasks/<task-id>/status.md` as detailed source of truth and show a sync warning. |
| Harness JSON changed after UI load | Refuse the stale write, return a conflict, and require refresh before retry. |
| Harness JSON has unknown user-authored keys | Preserve unknown keys and update only allowlisted paths. |
| Harness JSON write would fail schema validation | Refuse the write and leave the original file untouched. |
| Managed repo path resolves outside configured root | Refuse read/write access and show a boundary error. |
| Git command unavailable or repo is not git | Show git fields as unknown; do not fail the whole project scan. |
| Dirty worktree includes generated files like `.DS_Store` | Report dirty state without trying to clean it. |
| URL values are missing or set to `unknown` | Normalize to `null` in the UI and allow explicit user update. |
| This SharkBay repo is discovered | Display it like any other project; no hard-coded special path handling. |
| New harness target directory is non-empty | Stop and require a different path or future explicit overwrite policy. |

## 6. Risks

| Risk | Mitigation |
| --- | --- |
| Electron app setup adds packaging complexity | MVP focuses on local dev app first; packaging/signing is deferred. |
| Filesystem scanning can be slow | Start with user-configured roots, ignore heavy directories, and expose manual refresh before background watching. |
| Markdown parsing becomes brittle | Use JSON mirrors as primary state; display Markdown artifacts as text instead of over-parsing them. |
| IPC surface becomes too powerful | Define narrow typed IPC methods; no generic read/write path API in renderer. |
| Harness JSON writes could overwrite user edits | Use allowlisted patches, revision tokens, schema validation, and atomic read-modify-write. |
| Self-hosting creates circular confusion | Treat this repo as a normal harness repo and record state changes on disk before expecting the app to read them. |
| Direct Codex integration tempts scope expansion | Keep MVP to next-action prompt generation; runner remains future work behind approval and logs. |

## 7. Verification Plan

Design verification before coding:

- Review this design against `tasks/t-001-sharkbay-mvp-spec/spec.md`.
- Confirm all P0 requirements have modules and UI coverage.
- Confirm the self-hosting requirement is testable.
- Confirm no coding starts before `design_review` and `contract` pass.

Implementation verification later:

- Unit test scanner detection for manifest, protocol fallback, invalid JSON, and ignored directories.
- Unit test configured-root containment with canonical paths, sibling-prefix paths, `..` traversal, and symlink escape fixtures.
- Unit test scanner ignore behavior for `.git`, `node_modules`, build output, and hidden cache directories.
- Unit test harness reader normalization against this repository's current `.agent/` files.
- Unit test create-repo refusal for non-empty target directories and existing harness files.
- Unit test harness writer success cases for safe `.agent/manifest.json`, `.agent/state.json`, and `.agent/queue.json` read-modify-write updates.
- Unit test harness writer conflict cases for stale revision tokens, invalid existing JSON, unsupported patch paths, schema validation failures, symlinked harness files, and concurrent file changes before atomic rename.
- Unit test user-edit preservation by writing fixtures with unknown keys and confirming they survive URL/git/task mirror updates.
- Unit test URL persistence with state-file source of truth, manifest fallback, missing/`unknown` normalization, update validation, conflict handling, and returned revision tokens.
- Unit test prompt generator output for `t-001-sharkbay-mvp-spec`.
- Run app locally and visually verify the dashboard discovers this SharkBay repo from a configured root.
- Run app locally and verify URL editing updates `.agent/state.json`, refreshes the dashboard/detail URL fields, and refuses stale edits after an external file change.
- Record command output and screenshots in the task verification artifact.
