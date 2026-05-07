# t-042-settings-two-column-redesign

- Title: Redesign Settings as a two-column settings page
- Status: done
- Phase: done
- Priority: 1
- Depends on: none
- Opened: 2026-05-07T14:01:02+08:00
- Completed: 2026-05-07T14:09:19+08:00
- User request: "settings页面改版.做成典型的settings设置页面,分两栏,左侧是可选择的设置项,右边是实际设置内容."

## Scope

Rework the Settings view into a conventional two-column settings layout:

- Left column: selectable settings sections.
- Right column: actual controls/content for the selected section.
- Preserve existing scan root management and project creation behavior.

## Assumptions

- The first settings section should cover current workspace/scan root management.
- Project creation should remain in Settings, but can be grouped as a separate settings section.
- This task is UI structure and styling only; no filesystem authority or IPC behavior changes are intended.

## Done Criteria

- Settings renders as a two-column layout on desktop.
- Left navigation switches visible settings content without losing form state unnecessarily.
- Existing root add/remove/reload/create project actions remain available.
- Layout remains usable on narrow viewports.

## Verification Plan

- Inspect existing Settings component and style dependencies.
- Implement the two-column Settings view using existing React/CSS patterns.
- Run `npm run typecheck`, relevant tests if touched, `npm run build`, and `git diff --check`.

## Outcome

Settings now uses a conventional two-column settings layout with left-side navigation for Project roots and Status. Verification passed:

- `npm run typecheck`
- `npm run build`
- `git diff --check`
- `npm test -- tests/renderer-workflow.test.ts`
- `npm test`

Visual check was limited because `npm run dev` could not start on occupied port `5173`; the existing dev server returned HTTP 200.
