# Spec

## 1. User Goal

Before the Ripple setup flow, perform another UX improvement round autonomously: find issues, propose fixes, implement, review, revise, and verify using the UX Entity Discipline.

## 2. Problem

The current UI still contains interface details that are technically understandable but not always user-centered. Some elements may repeat facts, expose implementation details, preserve dead layout slots, use weak labels, or over-emphasize low-value information.

## 3. Requirements

| Priority | Requirement | Acceptance Criteria |
| --- | --- | --- |
| P1 | Apply generalized UX Entity Discipline | Visible UI elements help decision, action, context, or recovery. |
| P1 | Reduce repeated and non-actionable information | Repeated labels, sentinel values, and normal empty states are removed or hidden. |
| P1 | Preserve the working mental model | Left nav, project list, and detail/settings behavior remain recognizable. |
| P1 | Improve ordering and information hierarchy | Queue, project, and detail surfaces prioritize current or actionable information. |
| P1 | Self-review the result | Code review artifact records findings and any revision loop. |
| P1 | Verify the app still builds and tests pass | Typecheck, tests, build, and diff check pass. |

## 4. Non-Goals

- Implementing Ripple setup writes.
- Adding new integrations or server controls.
- Introducing a new design system dependency.
- Replacing the entire app navigation model.

## 5. Assumptions

- The app is still a personal/local workbench, so chrome and brand-like decoration should stay minimal.
- The user prefers quiet defaults, with pending decisions and exceptions drawing attention.
- Local CSS/React changes are enough for this pass.

## 6. Open Questions

| Question | Impact | Proposed Default |
| --- | --- | --- |
