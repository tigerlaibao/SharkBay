# Roadmap

## 1. Strategy

SharkBay should become a local-first project workbench, not a dashboard of implementation files. The user should first see projects, status, current work, links, and next actions. Low-frequency setup, roots, and protocol details should live in Settings or secondary detail views.

## 2. Phases

| Phase | Goal | Deliverables | Gate |
| --- | --- | --- | --- |
| 0 | Establish local macOS app foundation | Electron/React app, safe scan roots, project detail, prompt generation | Typecheck, tests, build, and dogfood scan pass |
| 1 | Make the UI project-centered | Projects/Settings IA, managed project list, current-task-first detail pane | User can understand what projects exist and what needs attention without reading protocol files |
| 2 | Discover ordinary local projects | Root child index, managed/unmanaged status, one-click Ripple setup path | User can see all child projects under a root, not only already-managed projects |
| 3 | Add runtime and repository operations | GitHub metadata, local dev server status, start/stop/restart actions, deployment commands | Operations are explicit, reversible where possible, and visibly logged |

## 3. Milestones

| Milestone | Target | Exit Criteria |
| --- | --- | --- |
| Project workbench v0 | Completed 2026-05-05 | Projects is primary; roots/create live in Settings; full tests and build pass |
| Root child discovery | Next | Scan roots show managed and unmanaged projects with clear setup affordance |

## 4. Dependencies

```text
t-001 foundation
  -> t-002 self-hosting UX
    -> t-003 dogfood fixes
      -> t-004 project-centered UI
        -> root child discovery and one-click Ripple setup
        -> runtime/GitHub/deployment operations
```
