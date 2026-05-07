# Spec

## 1. User Goal

Make SharkBay feel like a project workbench instead of a developer-oriented dump of harness internals.

## 2. Problem

The current UI exposes roots, create repo, metrics, tables, artifacts, queue, revisions, and prompt controls all at once. This makes a simple question hard to answer: what projects do I have, which ones are SharkBay/Ripple-enabled, and what should I do next?

## 3. Requirements

| Priority | Requirement | Acceptance Criteria |
| --- | --- | --- |
| P0 | Project-first IA | Main navigation has Projects and Settings, not separate roots/create top-level destinations. |
| P0 | Low visual pressure | Main dashboard shows fewer always-visible boxes and makes one selected project the focus. |
| P0 | Ripple status clarity | Harness-enabled projects are presented as Ripple-enabled projects; internals are secondary. |
| P0 | Preserve existing capabilities | Scan, root management, create repo, URL editing, prompt generation, queue/artifact inspection still remain reachable. |
| P1 | Next-step clarity | Selected project detail clearly shows current task, phase, gate, worktree, and next-action prompt area. |
| P1 | Follow-up model | Non-harness child project discovery and one-click Ripple adoption are documented as next backend work. |

## 4. Non-Goals

- Implement root child directory discovery in this slice.
- Implement one-click Ripple injection into existing projects.
- Implement dev server process control.
- Implement GitHub or deployment integrations.

## 5. Assumptions

- Existing scan results still represent Ripple-enabled projects only.
- Settings can own root management and new repo creation for now.
- It is acceptable to use “Ripple” as the user-facing term while preserving harness file internals.

## 6. Open Questions

| Question | Impact | Proposed Default |
| --- | --- | --- |
| Should the product term be Ripple, SharkBay Ripple, or another word? | Naming consistency | Use Ripple in UI copy and keep harness in technical docs. |
