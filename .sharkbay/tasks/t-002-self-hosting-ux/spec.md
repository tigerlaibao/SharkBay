# Spec

## 1. User Goal

As the developer building SharkBay, I want to open the local app, add `<projects-root>` or `<repo-root>` as a configured root, scan, see SharkBay itself in the dashboard, open its detail view, understand the current harness state, and copy a useful next-action prompt.

## 2. Problem

The MVP foundation has core scanner/reader/writer/UI pieces, but the first real user journey still needs polish. If the add-root, scan, detail, URL, and prompt workflow is clumsy or unclear, SharkBay technically works but does not yet feel like a control panel worth using daily.

## 3. Requirements

| Priority | Requirement | Acceptance Criteria |
| --- | --- | --- |
| P0 | First-run root setup | User can add a project root from the UI, see it persisted, and rescan without restarting. |
| P0 | Self-host discovery clarity | Scanning a root containing this repo shows `SharkBay` with path, branch/dirty state, active task, phase, gate status, and URLs. |
| P0 | Project detail usefulness | Detail view exposes queue, current task artifacts, recent decisions, errors, revisions, and verification/code-review artifacts in a readable way. |
| P0 | Prompt copy workflow | Detail view generates a next-action prompt for the selected project/task and provides a reliable copy action with visible feedback. |
| P0 | Safe URL editing | URL edits update `.agent/state.json` through the safe writer, refresh visible state, and show conflict/error feedback. |
| P1 | Empty/error states | No-root, unavailable-root, no-projects, parse-error, and scan-error states are clear and actionable. |
| P1 | Workflow verification | Tests or validation scripts prove root persistence, self-host discovery, URL edit behavior, and prompt content; dev smoke verifies the UI starts. |

## 4. Non-Goals

- Direct Codex execution or launching agents from the UI.
- Background scan/watch mode.
- Full Markdown rendering/editor functionality.
- Packaged macOS distribution.
- Managing arbitrary directories outside configured roots.

## 5. Assumptions

- SharkBay continues to use Electron + React + TypeScript + Vite.
- The current repository remains the first self-hosted test project.
- `.agent/state.json` remains the authoritative URL state.
- Renderer filesystem authority must stay narrow and mediated by IPC.

## 6. Open Questions

| Question | Impact | Proposed Default |
| --- | --- | --- |
| Should this task prioritize workflow polish over new backend features? | Keeps the slice small enough to verify end to end. | Yes; focus on the existing app surfaces and self-hosting flow. |
| Should direct browser/screenshot verification be required? | Stronger UI evidence, but may take extra time. | Run dev smoke and use manual/app verification where practical; keep screenshot capture optional unless needed. |

## 7. Spec Gate

| Gate Requirement | Result | Evidence |
| --- | --- | --- |
| Scope is clear | pass | Requirements target root setup, scan, detail, URL edit, and prompt copy workflow. |
| Non-goals are listed | pass | Direct execution, background watching, packaging, and broad filesystem access are excluded. |
| Acceptance criteria exist | pass | Each P0/P1 requirement includes acceptance criteria. |
