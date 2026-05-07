# Spec

## Problem

The current Projects view only shows directories that already contain SharkBay/Ripple files. That makes SharkBay feel incomplete when a configured root contains many real project folders but only some are currently managed.

The user model is:

- A scan root is a parent folder.
- Child folders under that root are projects.
- Some projects are already managed by SharkBay because they contain Ripple files.
- Other projects should still be visible with a clear setup action.

## Goal

Show ordinary child projects under configured roots, label each as managed or not setup, and prepare a safe setup path for adding Ripple files later.

## Acceptance Criteria

| Priority | Requirement | Acceptance Criteria |
| --- | --- | --- |
| P0 | Root child discovery | Scanning a configured root returns direct child directories as project candidates. |
| P0 | Managed status | Candidates with `.agent/manifest.json` or `.agent/protocol.md` are labeled managed and link to existing project detail. |
| P0 | Not setup status | Candidates without Ripple files are shown as not setup without parse errors. |
| P0 | Safety boundary | Discovery reads only inside configured roots and avoids symlink traversal surprises. |
| P1 | Setup affordance | Not-setup projects show a disabled or confirmation-gated setup action with clear copy. |
| P1 | UI pressure | The Projects view remains scannable and does not expose raw protocol details by default. |

## Non-Goals

- Automatically writing Ripple files into existing non-empty projects.
- Deep recursive discovery across arbitrary nested directories.
- Running project package managers or dev servers.
- GitHub/deployment metadata enrichment.

## Proposed Model

Introduce a project candidate shape alongside the existing managed project summary:

```ts
type ProjectCandidate = {
  id: string;
  name: string;
  path: string;
  rootPath: string;
  status: "managed" | "not_setup";
  managedProjectId: string | null;
  detection: DetectionMode | null;
};
```

The scanner can continue returning full managed project summaries while adding candidates for all direct child directories.

## Open Questions

| Question | Impact | Default |
| --- | --- | --- |
| Should root discovery include the root itself when it is a project? | Important for repos like SharkBay itself. | Yes, include the root itself plus direct children. |
| Should hidden folders be shown? | Avoid visual clutter and accidental system folders. | Hide dot-prefixed children except known managed root files. |
| Should setup action be enabled in this task? | File injection into non-empty projects needs design. | Show the affordance but keep actual injection gated/deferred. |
