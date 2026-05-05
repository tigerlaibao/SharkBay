# Design

## Summary

Add a read-only project candidate layer to scanning.

The scanner should keep returning full `ProjectSummary` records for managed projects. In addition, it should return lightweight candidates for the configured root itself and its direct child directories. Each candidate tells the UI whether that folder is already managed by SharkBay or not setup yet.

This preserves the existing safe read/write boundary and avoids pretending an ordinary folder has task state before Ripple files exist.

## Data Model

Add a shared type:

```ts
export type ProjectCandidate = {
  id: string;
  name: string;
  path: string;
  rootPath: string;
  status: "managed" | "not_setup";
  managedProjectId: string | null;
  detection: DetectionMode | null;
};
```

Extend `ScanProjectsResult`:

```ts
export type ScanProjectsResult = {
  roots: RootScanResult[];
  projects: ProjectSummary[];
  candidates: ProjectCandidate[];
};
```

Compatibility note: renderer normalization should treat missing `candidates` as an empty array so older preload shapes still work.

## Scanner Behavior

For each available configured root:

1. Resolve the real root path through `resolveConfiguredRoots`.
2. Add the root itself as a candidate if it is a managed project or a likely project folder.
3. Read direct child directories only.
4. Ignore heavy/generated folders using the existing ignore list.
5. Skip symbolic-link child directories.
6. Detect whether each candidate has Ripple files through `detectHarnessRepo`.
7. Keep the existing recursive `findHarnessRepos` path for full managed project summaries, so nested managed projects still appear.
8. Match candidates to managed projects by real path and fill `managedProjectId`.

Root itself matters because a user may configure `<repo-root>` directly rather than `<projects-root>`.

## UI Behavior

Projects should render one list of project candidates:

| Candidate State | UI Treatment |
| --- | --- |
| `managed` | Opens the current detail pane and shows phase/gate/worktree information. |
| `not_setup` | Shows the folder name/path, a neutral “Not setup” status, and a setup affordance. |
The setup affordance should be product-facing, such as `Set up Ripple`, but it should either be disabled or confirmation-gated in this task. Actual file injection into non-empty directories should be designed separately before enabling writes.

## Safety

- Reuse `resolveConfiguredRoots` before reading.
- Use `fs.realpath` for candidate paths.
- Include candidates only when `isPathInside(root.path, candidatePath)` is true.
- Do not traverse symlink directories.
- Do not read arbitrary nested children for the candidate list.
- Do not write any Ripple files in this task.

## Files Likely To Change

| File | Change |
| --- | --- |
| `src/shared/types.ts` | Add `ProjectCandidate`; extend `ScanProjectsResult`. |
| `src/main/scanner.ts` | Add direct child discovery and candidate matching. |
| `src/renderer/types.ts` | Mirror shared candidate result type. |
| `src/renderer/App.tsx` | Render candidates and preserve managed detail behavior. |
| `src/styles/app.css` | Add candidate row states if needed. |
| `tests/scanner.test.ts` | Cover direct child discovery, root-as-project, ignored folders, symlink skip, and managed matching. |
| `tests/renderer-workflow.test.ts` | Cover candidate status helpers if introduced. |

## Rollout

1. Backend returns `candidates` while still returning `projects`.
2. Renderer continues to function when `candidates` is absent.
3. UI switches the project list source from `projects` to candidates plus managed project lookup.
4. Setup action remains disabled or confirmation-only until the next write-safety task.

## Risks

| Risk | Mitigation |
| --- | --- |
| Candidate list duplicates managed projects. | Match by real path and render one row per candidate. |
| Direct root configured as the project disappears. | Include root itself as a candidate. |
| Not-setup folders overwhelm the list. | Ignore generated/heavy folders and keep filters/search. |
| Users expect setup to write immediately. | Use clear copy that setup is not yet enabled, or gate it behind a future confirmation design. |
