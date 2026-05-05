# Learnings

Record durable lessons here. Newest entries go first.

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
