# Tasks

## Current Stage

User-centered project workbench redesign, read-only root child discovery, autonomous UX polish, confirmation-gated Ripple setup, project-authored developer metadata, human intervention signals, setup-time agent onboarding instructions, and runner lifecycle separation are complete.

## Task List

| ID | Status | Title | Depends On | Notes |
| --- | --- | --- | --- | --- |
| `t-001-sharkbay-mvp-spec` | done | Define SharkBay MVP product, architecture, and implementation plan | none | Electron + React + TypeScript MVP foundation implemented and verified |
| `t-002-self-hosting-ux` | done | Polish the self-hosting dashboard workflow | `t-001-sharkbay-mvp-spec` | Dashboard/detail/root/prompt workflow polished and verified |
| `t-003-dogfood-self-hosting-flow` | done | Dogfood the self-hosting workflow and fix first-use friction | `t-002-self-hosting-ux` | Preload bridge, layout breakpoint, and gate fallback fixed and verified |
| `t-004-user-centered-project-workbench` | done | Reframe SharkBay as a user-centered project workbench | `t-003-dogfood-self-hosting-flow` | UI-first redesign; roots/create moved to Settings and Projects became the main workbench |
| `t-005-root-child-discovery` | done | Discover ordinary root child projects and show Ripple setup status | `t-004-user-centered-project-workbench` | Read-only candidates now show managed vs not-setup project visibility |
| `t-006-autonomous-ux-polish` | done | Autonomous UX discipline polish | `t-005-root-child-discovery` | Self-directed UX cleanup of project rows, not-setup detail, and queue/detail signals |
| `t-007-ripple-setup-flow` | done | Design confirmation-gated Ripple setup for existing projects | `t-006-autonomous-ux-polish` | Not-setup projects can now install Ripple after confirmation |
| `t-008-project-authored-url-metadata` | done | Design project-authored developer metadata | `t-007-ripple-setup-flow` | Optional `.agent/development.json` metadata now powers a read-only Project Info summary |
| `t-009-human-intervention-policy` | done | Define human intervention signals | `t-008-project-authored-url-metadata` | Needs Action now shows only real human intervention, not dirty or automatic phases |
| `t-010-agent-onboarding-instructions` | done | Ensure setup projects instruct agents to follow Ripple harness | `t-009-human-intervention-policy` | Bundled setup now installs `AGENTS.md`; existing `AGENTS.md` collisions preserve local files |
| `t-011-runner-lifecycle-heartbeat` | done | Separate runner lifecycle from harness phase | `t-010-agent-onboarding-instructions` | `.agent/runner.json` lease/heartbeat state keeps physical runner lifecycle separate from task phase |

## Completed Work

| ID | Completed | Verification |
| --- | --- | --- |
| `t-001-sharkbay-mvp-spec` | 2026-05-05 | `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, self-host scan probe, and dev smoke passed |
| `t-002-self-hosting-ux` | 2026-05-05 | `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, self-host scan probe, and dev smoke passed |
| `t-003-dogfood-self-hosting-flow` | 2026-05-05 | `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `git diff --check`, app dogfood scan, prompt generation, and dev smoke passed |
| `t-004-user-centered-project-workbench` | 2026-05-05 | `npm run typecheck`, `npm test`, `npm run build`, `git diff --check`, and subagent review passed |
| `t-005-root-child-discovery` | 2026-05-05 | `npm run typecheck`, scanner tests, renderer workflow tests, `npm test`, `npm run build`, `git diff --check`, and subagent review passed |
| `t-006-autonomous-ux-polish` | 2026-05-05 | `npm run typecheck`, `npm test`, `npm run build`, `git diff --check`, and self-review passed |
| `t-007-ripple-setup-flow` | 2026-05-05 | `npm run typecheck`, template installer tests, `npm test`, `npm run build`, and `git diff --check` passed |
| `t-008-project-authored-url-metadata` | 2026-05-05 | `npm run typecheck`, harness reader tests, `npm test`, `npm run build`, JSON parse check, and `git diff --check` passed |
| `t-009-human-intervention-policy` | 2026-05-05 | `npm run typecheck`, renderer workflow tests, `npm test`, `npm run build`, JSON parse check, UI check, and `git diff --check` passed |
| `t-010-agent-onboarding-instructions` | 2026-05-05 | `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `git diff --check`, JSON parse check, and dev-server smoke evidence passed; `npm run dev` was blocked by occupied port `5173` |
| `t-011-runner-lifecycle-heartbeat` | 2026-05-05 | `npm run typecheck`, `npm run lint`, focused runner tests, `npm test`, `npm run build`, `git diff --check`, and existing dev-server smoke evidence passed; `npm run dev` was blocked by occupied port `5173` |

## Task Detail Template

```markdown
### T-001: Title

- Status: todo
- Depends on: none
- Task folder: `tasks/t-001/`
- Dependency lock: coding cannot start until dependencies are `done`

Implementation checklist:

- [ ] Identify files to change
- [ ] Implement behavior
- [ ] Run required checks
- [ ] Review
- [ ] Update docs
```

## Dependency Graph

```text
t-001-sharkbay-mvp-spec (done)
  -> t-002-self-hosting-ux (done)
    -> t-003-dogfood-self-hosting-flow (done)
      -> t-004-user-centered-project-workbench (done)
        -> t-005-root-child-discovery (done)
          -> t-006-autonomous-ux-polish (done)
            -> t-007-ripple-setup-flow (done)
              -> t-008-project-authored-url-metadata (done)
                -> t-009-human-intervention-policy (done)
                  -> t-010-agent-onboarding-instructions (done)
                    -> t-011-runner-lifecycle-heartbeat (done)
```
