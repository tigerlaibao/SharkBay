# Spec

## 1. User Goal

From the Projects view, select a project that is not set up yet and install the Ripple harness into that existing project with a clear, deliberate confirmation step.

## 2. Problem

SharkBay currently discovers ordinary child projects but only shows a placeholder for folders that do not contain Ripple files. The existing template installer refuses non-empty directories, which is safe for brand-new project creation but blocks the core SharkBay workflow: turning an existing project into a managed Ripple project.

Installing into an existing directory is a write operation. It must be narrow, predictable, and easy to understand before it happens.

## 3. Requirements

| Priority | Requirement | Acceptance Criteria |
| --- | --- | --- |
| P0 | Confirmation-gated setup | Not-setup projects expose setup only through an explicit confirmation action. |
| P0 | Configured-root boundary | Setup only writes inside configured roots and rejects symlink escape paths. |
| P0 | No overwrite | Setup refuses to overwrite any existing file or existing `.agent` harness. |
| P0 | Template-based install | Setup writes the bundled harness template with project name/path variables. |
| P1 | Clear result | After setup, the workbench refreshes and the project appears as managed. |
| P1 | Useful failure messages | Unsafe path, existing harness, file collision, and template errors are shown to the user. |
| P1 | Test coverage | Backend safety, runtime authority, and renderer workflow behavior are covered. |

## 4. Non-Goals

- Auto-discovering or auto-writing local/test/deploy URLs.
- Running the new project's own agent immediately after setup.
- Editing package files, GitHub remotes, deployment config, or dev server commands.
- Bulk setup of multiple projects.

## 5. Assumptions

- The bundled template is still the source of truth for the initial Ripple files.
- Existing project files must be treated as user-owned and never overwritten.
- A simple confirmation UI is enough for this slice; richer previews can come later if needed.
- Project-authored URL metadata belongs in `t-008-project-authored-url-metadata`.

## 6. Open Questions

| Question | Impact | Proposed Default |
| --- | --- | --- |
| Should confirmation require typing the project name? | More safety, more friction. | Use a two-step confirm button in this slice; add typed confirmation later only if accidental setup feels likely. |
