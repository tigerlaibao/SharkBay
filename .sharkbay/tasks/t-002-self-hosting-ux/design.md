# Design

## 1. Summary

Polish the first self-hosting workflow without expanding SharkBay into direct execution. The user should be able to open the app, add a root, scan, find SharkBay itself, inspect the current harness state, optionally edit URLs, and copy a next-action prompt with clear feedback.

This task builds on the existing Electron/React foundation. It should refine the current UI and add workflow-focused tests rather than rewrite the architecture.

## 2. Proposed Approach

### Workflow

```text
First run / empty state
  -> Add root path
  -> Scan projects
  -> Dashboard highlights SharkBay when present
  -> Open detail
  -> Inspect active task and artifacts
  -> Edit URLs if needed
  -> Copy next-action prompt
```

### UI Changes

| Area | Change | Reason |
| --- | --- | --- |
| Empty dashboard | Show a compact first-run panel with a suggested root input, scan button, and current safety boundary note | Make the app usable before any projects exist |
| Root management | Keep root add/remove visible from dashboard, not only settings | Root setup is the first action |
| Scan feedback | Show last scan time, project count, unavailable root count, and parse/safety errors | Make scanning feel deterministic |
| Project table | Emphasize project name, phase, active task, dirty state, and detection mode; add a `self-host` marker when path matches this repo | Help the user spot SharkBay itself |
| Detail header | Show project path, branch/dirty state, active task, phase, gate, and URL summary in one scan-friendly header | Reduce hunting around |
| Artifact viewer | Keep tabs but add empty states and highlight status/verification/code-review when available | Make task state easier to inspect |
| URL editor | Show current revision, save state, conflict/error messages, and refresh after save | Make safe writer behavior visible |
| Prompt panel | Generate prompt on demand, show copy status, include task/phase/checks summary near the button | Make next action feel reliable |

### Data and IPC

No broad new IPC surface is needed. Existing preload methods remain sufficient:

- `config:listRoots`, `config:addRoot`, `config:removeRoot`
- `projects:scan`, `projects:getDetail`, `projects:updateUrls`
- `projects:createHarnessRepo`
- `prompts:nextAction`

Renderer code should stop passing `configuredRoots` as an authority signal where runtime APIs ignore it. If a type currently requires it, keep the value harmless or narrow the renderer-side type to reflect the runtime contract.

### Self-Host Marker

The UI should mark a project as self-hosted when a deterministic renderer helper returns true:

- `project.name === "SharkBay"`
- `project.path` ends with `/SharkBay`
- `project.detection === "manifest"`
- `project.activeTask?.taskId` starts with `t-`

This is presentational only. It must not change scanner/reader behavior, write behavior, or project ordering. If the helper is wrong, the app still works; only the marker is affected.

### Detail Sections

The detail view must explicitly cover every P0 data surface:

| Section | Required Content | Empty/Error State |
| --- | --- | --- |
| Overview | Project name, path, detection mode, repo URL, branch, dirty state, active task, phase, gate, local/test/deployment URLs | Show `unknown` or `unset` labels, not blank space |
| Queue | Active, backlog, and done task sections with task id, title, phase, status, dependsOn, and priority where present | Show `No tasks in this section` |
| Current task artifacts | Status, spec, design, design review, contract, implementation, code review, verification, and decisions tabs | Show `Artifact not found` for missing files |
| Recent decisions | Date, decision, and source from `.agent/state.json` | Show `No recent decisions recorded` |
| Harness errors | Parse errors, unsafe path errors, unavailable artifact errors, and sync warnings surfaced from the reader | Hide section when empty; show as high-contrast diagnostics when present |
| Revisions | Manifest/state/queue revision tokens used for stale-write protection | Show `missing` when unavailable |
| Prompt | Generated next-action prompt and copy state | Keep prompt text visible even if clipboard copy fails |

## 3. Files and Modules

| File/Module | Change | Reason |
| --- | --- | --- |
| `src/renderer/App.tsx` | Refine workflow states, dashboard actions, detail layout, URL save feedback, and prompt copy behavior | Main user journey lives here |
| `src/renderer/types.ts` | Adjust renderer-only types if needed for workflow state | Keep UI types aligned with runtime API |
| `src/renderer/sharkbay-api.d.ts` | Keep global bridge declarations aligned if UI call shapes change | Type safety |
| `src/styles/app.css` | Polish dense workflow layout, empty states, status markers, and feedback states | UX clarity |
| `tests/renderer-workflow.test.ts` or equivalent | Add focused tests for workflow helper logic where practical | Prove first-run/root/prompt behavior without overbuilding browser tests |
| `tests/self-host-workflow.test.ts` or equivalent | Add scripted workflow checks for root persistence, self-host discovery, URL update, and prompt content | Prove P0 workflow behaviors outside manual observation |
| `tasks/t-002-self-hosting-ux/implementation.md` | Record implementation notes and command evidence | Harness requirement |

## 4. Data/API/UI Impact

Data model changes should be minimal. The task should use existing `ProjectSummary`, `ProjectDetail`, `RevisionMap`, and URL update result types.

UI state additions may include:

```ts
type WorkflowStatus = {
  lastScanAt: string | null;
  rootCount: number;
  projectCount: number;
  unavailableRootCount: number;
  selectedProjectId: string | null;
};
```

Prompt copy state should be local UI state:

```ts
type CopyState = "idle" | "copied" | "failed";
```

No managed repository files should be mutated except URL edits through `projects:updateUrls`.

## 5. Edge Cases

| Case | Handling |
| --- | --- |
| No configured roots | Show first-run panel and root input. |
| Root path input is empty | Disable add button or show inline error. |
| Root unavailable | Keep root visible with unavailable state and continue scanning other roots. |
| Scan returns zero projects | Show no-projects empty state with guidance to choose a parent directory containing harness repos. |
| SharkBay not found | Do not fail the app; show normal project list/empty state. |
| Detail load fails | Keep selected project visible and show error with retry. |
| URL save conflict | Show conflict/error message and offer refresh. |
| Prompt copy API unavailable | Show prompt text for manual selection and an error toast. |
| Clipboard write fails | Keep prompt visible and show failure feedback. |
| Protocol fallback repo | Disable URL editing if required state revision is missing. |

## 6. Risks

| Risk | Mitigation |
| --- | --- |
| UI polish becomes a broad redesign | Keep changes inside existing app shell and workflow screens. |
| Hard-coding SharkBay path leaks into core logic | Keep self-host marker presentational and do not alter scanner/reader behavior. |
| URL editing accidentally broadens write surface | Continue using `projects:updateUrls` only. |
| Browser-style tests become heavy | Test pure workflow helpers where possible; rely on typecheck/build/dev smoke for UI integration. |
| Copy-to-clipboard behavior varies by environment | Keep prompt visible even when clipboard write fails. |

## 7. Verification Plan

Required checks:

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`
- `git diff --check`

Workflow verification:

- Dev smoke with `npm run dev`.
- Self-host scan probe confirms SharkBay can still be discovered from `<projects-root>`.
- Automated or scripted checks must cover:
  - root add/list/remove persistence using app config helpers;
  - scanning a fixture root that contains a SharkBay-like harness repo;
  - scanning `<projects-root>` and finding this repo when run on the developer machine;
  - detail data coverage for queue, current task artifacts, recent decisions, errors, and revisions;
  - safe URL update through `projects:updateUrls` or the underlying runtime service, including visible refresh data and stale revision conflict behavior;
  - generated prompt content including repo path, task id, phase, protocol reference, required checks, stop conditions, and no-chat-memory instruction;
  - presentational self-host marker helper behavior.
- Manual UI verification, where practical:
  - no-root or existing-root state renders;
  - root can be added/listed;
  - scan completes;
  - SharkBay appears in dashboard;
  - detail opens;
  - next-action prompt is generated and copy feedback appears.
