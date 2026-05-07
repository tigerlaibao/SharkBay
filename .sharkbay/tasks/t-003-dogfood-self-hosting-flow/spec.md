# Spec

## 1. User Goal

Use SharkBay itself as a real local app and make the first self-hosting workflow feel coherent enough for daily use.

## 2. Problem

The app has the necessary UI and tests, but it has not yet been driven as a real user flow in the desktop shell. Some friction only appears once the user sees the actual layout, startup behavior, and copy/edit interactions together.

## 3. Requirements

| Priority | Requirement | Acceptance Criteria |
| --- | --- | --- |
| P0 | Dogfood app startup | `npm run dev` starts Vite, TypeScript watch, and Electron without blocking runtime errors. |
| P0 | Self-host scan works in app | User can add or use `<projects-root>`, scan, and see SharkBay itself in the dashboard. |
| P0 | Detail is understandable | SharkBay detail clearly shows active task, phase, queue, revisions, artifacts, errors, and prompt panel. |
| P0 | Prompt is usable | User can generate/copy a next-action prompt or clearly see the prompt text if clipboard fails. |
| P0 | Small friction fixes | Any discovered low-risk first-use issues are fixed and covered by checks. |
| P1 | Evidence | Verification records commands, observed UI behavior, and residual risks. |

## 4. Non-Goals

- Direct Codex execution from SharkBay.
- Background jobs/watchers.
- Packaging, signing, notarization, or distribution.
- Major redesign or new architecture.

## 5. Assumptions

- The first dogfood pass should favor small UI fixes over new systems.
- Existing safety boundaries remain in force.
- If a major architecture issue appears, stop and create a follow-up task.

## 6. Open Questions

| Question | Impact | Proposed Default |
| --- | --- | --- |
| How many issues should this task fix? | Prevents unbounded polish. | Fix up to three small workflow issues; record the rest as follow-up. |

## 7. Spec Gate

| Gate Requirement | Result | Evidence |
| --- | --- | --- |
| Scope is clear | pass | Dogfood startup, root scan, detail, prompt, and small fixes. |
| Non-goals are listed | pass | Direct execution, background jobs, packaging, major redesign excluded. |
| Acceptance criteria exist | pass | P0/P1 requirements above. |
