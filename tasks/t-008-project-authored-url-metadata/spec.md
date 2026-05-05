# Spec

## 1. User Goal

SharkBay should make each project easier to develop by showing useful project facts without making the user manually configure per-project settings.

The ideal direction is read-only project details: project agents working inside each harness-managed project should continuously extract and update developer metadata as part of normal harness work. SharkBay should read that metadata and present it quietly.

## 2. Problem

The current project settings model exposes manual URL fields. That makes SharkBay responsible for guessing or asking the user for data that belongs to the project itself.

Useful project context is broader than URLs:

- tech stack and package manager
- local dev commands and ports
- test commands and test environment
- deployment targets, domains, and preview URLs
- tools and services used by the project
- operational notes that reduce development friction

If these details are scattered across chat history, README files, deployment dashboards, and agent memory, each new work session pays the same rediscovery cost.

## 3. Requirements

| Priority | Requirement | Acceptance Criteria |
| --- | --- | --- |
| P0 | Read-only first | SharkBay project detail does not require manual settings for developer metadata. |
| P0 | Project-authored source | Metadata is stored in harness files and updated by the project agent during harness work. |
| P0 | Useful developer facts | Metadata can represent stack, scripts, runtime URLs, ports, deployments, tools, and notes. |
| P1 | Manifest-backed design | The default design chooses the correct harness source file and documents why. |
| P1 | Quiet UI | SharkBay shows high-value facts first and hides absent/unknown facts. |
| P1 | Update protocol | Harness protocol tells agents when to review and update metadata. |
| P1 | Compatibility | Existing projects without metadata still load without warnings. |

## 4. Non-Goals

- Manual editing UI for the metadata.
- Automatic command execution, deployment, or port probing from SharkBay.
- Full external service integrations.
- Perfect inference of every project tool in this slice.

## 5. Assumptions

- `manifest.json` is the best default home for relatively stable project metadata, while `state.json` remains for current workflow/runtime state.
- Project agents can update manifest fields through future narrow writer APIs or by normal harness file edits inside their own project.
- SharkBay should tolerate partial metadata and display only useful present facts.

## 6. Open Questions

| Question | Impact | Proposed Default |
| --- | --- | --- |
| Should rapidly changing runtime status live in `manifest.json` or `state.json`? | Avoid stale facts in the stable manifest. | Store stable descriptors in `manifest.json`; defer live process status to a future state-backed task. |
| How much metadata should the first UI show? | Prevent the right pane from becoming a dashboard dump. | Show stack, primary scripts, runtime links, deployments/tools summaries; use progressive disclosure later. |
