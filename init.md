# SharkBay Harness Init

This file is a portable bootstrap contract pre-seeded for SharkBay. Copy it into the root of the new SharkBay repository, then tell the local coding model:

```text
Read init.md and bootstrap this repository according to it.
```

The bootstrap process should create the harness files, initialize project knowledge templates, seed SharkBay's project context, ask only for missing decisions, then enter the Ripple controller workflow.

## 0. Project Seed: SharkBay

Use this section to initialize the repository knowledge if the current repository appears empty or does not already have stronger project documentation.

| Field | Value |
| --- | --- |
| Product name | SharkBay |
| Domain | `sharkbay.xyz` |
| Repo name | `sharkbay` |
| Project type | local-first web app / developer tool |
| Primary user | A developer managing many local harness-enabled repositories |
| Core promise | A single dashboard for harness-enabled repos, tasks, phases, gates, repo status, local URLs, and deployment URLs |

SharkBay is a local project management and harness dashboard for file-based development workflows. It scans configured project roots, detects repositories initialized with this harness protocol, shows their current lifecycle state, and helps the user create or advance tasks without manually switching between many sessions.

### MVP Scope

Build the first version around these capabilities:

1. Scan one or more local project root directories.
2. Detect harness repositories via `.agent/manifest.json`, with fallback detection through `.agent/protocol.md`.
3. Show a project dashboard with project name, path, repo URL, current branch, dirty state, active task, phase, gate status, local URL, and deployment URL.
4. Show a project detail page with queue, active task, lifecycle phase, review findings, verification evidence, and recent decisions.
5. Create a new harness repository from bundled templates.
6. Write machine-readable state files: `.agent/manifest.json`, `.agent/state.json`, and `.agent/queue.json`.
7. Generate a "next action" prompt that can be copied into an agent or tool session for the selected project.

### Deferred Scope

Do not build these in the first task unless the user explicitly changes scope:

- Full autonomous background execution.
- Direct multi-agent orchestration.
- Cloud sync or multi-user collaboration.
- Production deployment automation.
- Billing, accounts, or permissions.
- Remote code execution.

### First Task Seed

After bootstrap, create the first active task unless the user asks otherwise:

| Field | Value |
| --- | --- |
| Task ID | `t-001-sharkbay-mvp-spec` |
| Title | Define SharkBay MVP product, architecture, and implementation plan |
| Priority | 1 |
| Phase | `spec` |
| Depends On | none |

The first task should produce a clear MVP spec and design before coding begins.

### Stack Decision

Do not assume the final stack without asking. If the user wants a default recommendation, propose a local-first TypeScript web app with a small Node backend and a React UI, because SharkBay needs filesystem scanning plus a browser-based dashboard.

## 1. Bootstrap Role

You are the bootstrap agent for this repository.

Your job is to turn the current directory into a tool-neutral engineering harness:

- Repository knowledge lives in versioned files, not chat memory.
- Task progress is recoverable from disk.
- Design, review, coding, and verification are separate phases.
- Each phase has a clear artifact and gate.
- The user talks to one controller, and the controller advances one task at a time.

Work only inside the current repository root unless the user explicitly allows otherwise.

## 2. Safety Rules

Before writing files:

1. Inspect the current directory.
2. If a file already exists, do not overwrite it blindly.
3. If the repository already has project docs, preserve them and add missing harness files.
4. If this is not an empty repository, summarize what you found before making broad changes.
5. Do not delete files.
6. Do not run destructive git commands.
7. Do not install dependencies unless the user asks.

If there is uncertainty, prefer creating clearly marked draft files over modifying existing important files.

## 3. Target File Tree

Create this structure if missing:

```text
.
├── AGENTS.md
├── .agent/
│   ├── manifest.json
│   ├── state.json
│   ├── queue.json
│   ├── protocol.md
│   ├── queue.md
│   ├── state.md
│   └── quality-rules.md
├── docs/
│   ├── agents.md
│   ├── product.md
│   ├── architecture.md
│   ├── roadmap.md
│   ├── task.md
│   └── learnings.md
├── scripts/
│   └── README.md
└── tasks/
    └── _template/
        ├── status.md
        ├── spec.md
        ├── design.md
        ├── design-review.md
        ├── contract.md
        ├── implementation.md
        ├── code-review.md
        ├── verification.md
        └── decisions.md
```

Optional docs may be added later:

```text
docs/ui-design.md
docs/api.md
docs/database.md
docs/deployment.md
docs/testing.md
docs/version.md
docs/<feature>-design.md
```

## 4. File Templates

### 4.1 `AGENTS.md`

```markdown
# AGENTS.md

This repository uses a tool-neutral engineering harness.

## Start Here

Before starting any task, read:

1. `.agent/manifest.json` — machine-readable repository identity
2. `.agent/state.json` — machine-readable current state
3. `.agent/queue.json` — machine-readable task queue
4. `.agent/protocol.md` — controller workflow and phase rules
5. `.agent/queue.md` — human-readable active task queue
6. `.agent/state.md` — human-readable repo-level state
7. `docs/product.md` — product context
8. `docs/architecture.md` — technical structure and boundaries
9. `docs/task.md` — human-readable task list
10. `docs/learnings.md` — durable lessons from prior work

## Operating Rule

Do not rely on chat memory as the source of truth. If a decision, task state, test result, or review finding matters, write it to the appropriate file.

## Default Workflow

When the user asks to continue or advance work:

1. Read `.agent/protocol.md`.
2. Read `.agent/queue.json` and `.agent/queue.md`, then choose the highest-priority active task.
3. Check dependency locks before advancing the task.
4. Read `tasks/<task-id>/status.md`.
5. Execute exactly one phase transition.
6. Write or update the phase artifact.
7. Update `tasks/<task-id>/status.md`.
8. Update `.agent/state.json` and `.agent/state.md` if repo-level state changed.
9. Keep `.agent/queue.json` and `.agent/queue.md` in sync.
10. Stop when user approval is required.

## Quality Gate

Design and code do not pass because they "look fine." They pass only when the relevant review and verification gates in `.agent/quality-rules.md` are satisfied.
```

### 4.2 `.agent/manifest.json`

```json
{
  "schemaVersion": 1,
  "harness": {
    "name": "ripple-harness",
    "protocolVersion": "0.1.0"
  },
  "project": {
    "name": "SharkBay",
    "slug": "sharkbay",
    "type": "local-first-web-app",
    "description": "A local dashboard for managing harness-enabled repositories.",
    "domain": "sharkbay.xyz"
  },
  "repository": {
    "path": ".",
    "gitRoot": "unknown",
    "remoteOrigin": "unknown",
    "githubUrl": "unknown",
    "defaultBranch": "unknown"
  },
  "runtime": {
    "localUrl": "unknown",
    "deploymentUrl": "unknown",
    "testUrl": "unknown"
  },
  "files": {
    "state": ".agent/state.json",
    "queue": ".agent/queue.json",
    "protocol": ".agent/protocol.md",
    "humanState": ".agent/state.md",
    "humanQueue": ".agent/queue.md"
  }
}
```

### 4.3 `.agent/state.json`

```json
{
  "schemaVersion": 1,
  "updatedAt": "unknown",
  "repository": {
    "isGitRepository": "unknown",
    "gitRoot": "unknown",
    "currentBranch": "unknown",
    "defaultBranch": "unknown",
    "remoteOrigin": "unknown",
    "githubUrl": "unknown",
    "dirtyWorktree": "unknown"
  },
  "project": {
    "name": "SharkBay",
    "type": "local-first-web-app",
    "currentFocus": "Define SharkBay MVP product, architecture, and implementation plan",
    "localUrl": "unknown",
    "deploymentUrl": "unknown",
    "testUrl": "unknown"
  },
  "currentTask": {
    "taskId": "t-001-sharkbay-mvp-spec",
    "phase": "spec",
    "nextAction": "Write the MVP spec for SharkBay and update task status.",
    "blockedBy": []
  },
  "recentDecisions": [],
  "openQuestions": []
}
```

### 4.4 `.agent/queue.json`

```json
{
  "schemaVersion": 1,
  "updatedAt": "unknown",
  "active": [
    {
      "priority": 1,
      "taskId": "t-001-sharkbay-mvp-spec",
      "title": "Define SharkBay MVP product, architecture, and implementation plan",
      "phase": "spec",
      "dependsOn": [],
      "status": "active"
    }
  ],
  "backlog": [],
  "done": []
}
```

### 4.5 `.agent/protocol.md`

```markdown
# Ripple Controller Protocol

## 1. Purpose

This protocol defines how an agent or tool should act as the controller for this repository.

The controller coordinates planning, design, review, implementation, verification, documentation updates, and task state transitions.

## 2. Controller Loop

When asked to advance work:

```text
load AGENTS.md
load .agent/protocol.md
load .agent/manifest.json
load .agent/state.json
load .agent/queue.json
load .agent/queue.md
load .agent/state.md
detect repository identity if missing
select highest-priority active task
check task dependency locks
load tasks/<task-id>/status.md
execute one phase transition
write phase artifact
update task status
update queue/state if needed
report concise result to user
```

Execute one phase at a time unless the user explicitly asks for a larger run.

## 2.1 Machine-Readable State

This harness uses both Markdown and JSON:

- Markdown files are for human-readable reasoning and review.
- JSON files are for SharkBay, scripts, dashboards, and reliable scanning.

Keep these files synchronized:

| Human-readable | Machine-readable |
| --- | --- |
| `.agent/state.md` | `.agent/state.json` |
| `.agent/queue.md` | `.agent/queue.json` |
| `tasks/<task-id>/status.md` | task entries in `.agent/queue.json` |

If there is a conflict, treat the task's `tasks/<task-id>/status.md` as the detailed task source of truth, then update the JSON mirror.

## 3. Phases

Allowed phases:

```text
intake
spec
design
design_review
design_revision
contract
coding
code_review
code_revision
verification
docs_update
done
blocked
```

## 4. Role Mapping

The same model may play different roles, but roles must be separated by phase and artifact.

| Phase | Role | Primary Artifact |
| --- | --- | --- |
| intake | Controller | `tasks/<task-id>/status.md` |
| spec | Planner | `tasks/<task-id>/spec.md` |
| design | Designer | `tasks/<task-id>/design.md` |
| design_review | Reviewer | `tasks/<task-id>/design-review.md` |
| design_revision | Designer | `tasks/<task-id>/design.md` |
| contract | Planner + Reviewer | `tasks/<task-id>/contract.md` |
| coding | Implementer | code + `tasks/<task-id>/implementation.md` |
| code_review | Reviewer | `tasks/<task-id>/code-review.md` |
| code_revision | Implementer | code + `tasks/<task-id>/implementation.md` |
| verification | Verifier | `tasks/<task-id>/verification.md` |
| docs_update | Maintainer | `docs/task.md`, `docs/learnings.md`, relevant docs |
| done | Controller | `tasks/<task-id>/status.md` |

## 5. Transition Rules

### intake -> spec

Allowed when:

- User goal is captured.
- Task id exists.
- Initial priority is set.
- Open questions are listed.

### spec -> design

Allowed when:

- Scope is clear.
- Non-goals are listed.
- Acceptance criteria exist.

### design -> design_review

Allowed when:

- Design covers behavior, data, UI/API implications, risks, and rollout.
- Files/modules likely to change are listed.

### design_review -> design_revision

Required when:

- Any blocker or major issue exists.

### design_review -> contract

Allowed when:

- Blocker count is 0.
- Major count is 0.
- Minor issues are either accepted or tracked.

### contract -> coding

Allowed when:

- All dependency tasks are `done`, unless the user explicitly overrides the dependency lock.
- Done criteria are explicit.
- Files in scope are named.
- Files out of scope are named.
- Required checks are listed.
- Stop conditions are listed.

### coding -> code_review

Allowed when:

- Implementation notes are written.
- User-visible behavior is summarized.
- Known risks are listed.
- Required automated checks from `contract.md` have run, or inability to run them is recorded with the exact error.

### code_review -> code_revision

Required when:

- Any blocker or major issue exists.

### code_review -> verification

Allowed when:

- Blocker count is 0.
- Major count is 0.
- Required review findings are addressed.

### verification -> docs_update

Allowed when:

- Required checks have run, or inability to run them is recorded.
- Results and evidence are written to `verification.md`.
- Critical logic is covered by tests or validation scripts, unless the user explicitly accepts manual-only verification.

### docs_update -> done

Allowed when:

- `docs/task.md` reflects completed work.
- `docs/learnings.md` is updated if a durable lesson was learned.
- `status.md` has final outcome and verification summary.

## 6. Approval Stops

Stop and ask the user before:

- Expanding task scope significantly.
- Making destructive changes.
- Changing architecture beyond the approved design.
- Skipping required verification.
- Touching secrets, credentials, billing, or production data.
- Merging, releasing, deploying, or publishing.

## 7. Dependency Locks

Task dependencies are hard gates.

Before moving a task into `coding`, the controller must:

1. Read the task's dependency list from `.agent/queue.md` and `tasks/<task-id>/status.md`.
2. Confirm each dependency task is marked `done`.
3. Refuse to enter `coding` if any dependency is not done.
4. Mark the task `blocked` if the dependency cannot be resolved immediately.

The user may explicitly override a dependency lock, but the override must be recorded in `tasks/<task-id>/decisions.md`.

## 8. Evidence Discipline

Verification must leave evidence, not just claims.

For command-based checks, record:

- Command
- Exit code
- Relevant console output excerpt
- Full log path if output is long

For UI or browser checks, record:

- Screenshot path, video path, or trace path
- Viewport or device used
- Interaction steps performed

For critical logic, prefer tests or validation scripts over manual observation.

If no test framework exists, create a small project-local validation script under `scripts/` when reasonable, or record why this was not possible.

## 9. State Discipline

Every phase must update `tasks/<task-id>/status.md`.

Do not mark a task done unless:

- The phase is `done`.
- Verification has a recorded result.
- Remaining risks are explicitly documented.
```

### 4.6 `.agent/queue.md`

```markdown
# Agent Queue

## Active

| Priority | Task ID | Title | Phase | Depends On | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | `t-001-sharkbay-mvp-spec` | Define SharkBay MVP product, architecture, and implementation plan | spec | none | active |

## Backlog

| Priority | Task ID | Title | Depends On | Notes |
| --- | --- | --- | --- | --- |

## Done

| Task ID | Title | Completed |
| --- | --- | --- |

## Rules

- Highest priority active task is selected first.
- Lower number means higher priority.
- Do not start backlog tasks until they are moved to Active.
- Keep phase in sync with `tasks/<task-id>/status.md`.
- Treat `Depends On` as a hard lock before `coding`.
- If a dependency is not `done`, set the blocked task phase to `blocked` and record the blocker in `tasks/<task-id>/status.md`.
```

### 4.7 `.agent/state.md`

```markdown
# Agent State

## Repository Status

- Project type: local-first web app / developer tool
- Current focus: Define SharkBay MVP product, architecture, and implementation plan
- Last controller run: never

## Repository Identity

- Git root: unknown
- Is git repository: unknown
- Current branch: unknown
- Default branch: unknown
- Remote origin: unknown
- GitHub repository: unknown
- Dirty worktree: unknown

## Current Task

- Task ID: `t-001-sharkbay-mvp-spec`
- Phase: spec
- Next action: Write the MVP spec for SharkBay and update task status.
- Blocked by: none

## Recent Decisions

| Date | Decision | Source |
| --- | --- | --- |

## Open Questions

| Question | Needed For | Owner |
| --- | --- | --- |
```

### 4.8 `.agent/quality-rules.md`

```markdown
# Quality Rules

## Severity

| Severity | Meaning | Gate Impact |
| --- | --- | --- |
| blocker | Cannot proceed safely | Must fix before advancing |
| major | Likely bug, broken requirement, or risky design gap | Must fix before advancing |
| minor | Improvement, cleanup, edge case, or clarity issue | Track or fix |
| note | Useful observation | Does not block |

## Design Review Gate

Design passes only when:

- blocker = 0
- major = 0
- Scope and non-goals are explicit.
- Data/API/UI implications are covered when relevant.
- Risks and edge cases are listed.
- Verification approach is clear.

## Code Review Gate

Code passes only when:

- blocker = 0
- major = 0
- Implementation matches `contract.md`.
- No unrelated changes are introduced.
- Errors and edge cases are handled.
- Required checks from `contract.md` have run, or skipped checks are justified.
- Tests or verification scripts cover the critical path.
- `code-review.md` includes command evidence or explains why command evidence is unavailable.

## Verification Gate

Verification passes only when:

- Required commands/checks were run successfully, or skipped checks are justified.
- `verification.md` records command, exit code, and relevant console output excerpt for each command check.
- Full logs, screenshots, videos, or traces are saved under the repository when useful, and their paths are recorded.
- User-facing behavior was verified when applicable.
- Critical logic was cross-validated by tests or validation scripts, unless the user explicitly accepts manual-only verification.
- Known residual risks are recorded.

## Evidence Requirements

Do not write vague verification such as "tests passed" without evidence.

Acceptable evidence includes:

- Exact command output excerpts.
- Test report paths.
- Screenshot, video, or trace paths.
- Script output with exit code.
- Manual reproduction steps plus observed result, only when automation is not reasonable.

For important business logic, data migration, security behavior, billing, persistence, or parsing, manual observation alone is not enough. Add or run a test, fixture, or validation script.

## Documentation Gate

Documentation passes only when:

- `docs/task.md` reflects current task state.
- Durable lessons are added to `docs/learnings.md`.
- Feature or architecture docs are updated when behavior or design changed.
```

### 4.9 `docs/agents.md`

```markdown
# Agent Guide

This file provides guidance to automation agents and contributors when working in this repository.

## Project Overview

- Product: SharkBay
- Project type: local-first web app / developer tool
- Current phase: bootstrap

## Required Reading

Start with:

- `AGENTS.md` — repository entry point
- `.agent/manifest.json` — machine-readable project identity
- `.agent/state.json` — machine-readable repository state
- `.agent/queue.json` — machine-readable task queue
- `.agent/protocol.md` — controller workflow
- `.agent/queue.md` — human-readable task queue
- `.agent/state.md` — human-readable repository state
- `docs/product.md` — product requirements
- `docs/architecture.md` — architecture and module boundaries
- `docs/task.md` — human-readable task list
- `docs/learnings.md` — durable lessons
- `scripts/README.md` — validation script conventions

## Development Commands

Fill this section after the stack is known.

| Action | Command |
| --- | --- |
| Install dependencies | TBD |
| Start dev server | TBD |
| Run lint | TBD |
| Run typecheck | TBD |
| Run tests | TBD |
| Run task verification scripts | TBD |
| Build | TBD |

## Automation Scripts

Use `scripts/` for project-local validation helpers that make verification repeatable.

Conventions:

- Prefer small scripts with clear names, such as `scripts/verify-auth-flow.sh` or `scripts/check-fixtures.ts`.
- Scripts must print useful pass/fail evidence.
- Scripts should return non-zero on failure.
- Do not hide important failures behind broad catch blocks.
- Record script command, exit code, and output excerpt in `tasks/<task-id>/verification.md`.

## Code Review Preconditions

Before entering or completing `code_review`, run the checks named in `tasks/<task-id>/contract.md`.

If the project has known commands, prefer this order:

1. lint
2. typecheck
3. unit tests
4. build
5. task-specific verification scripts

If a command is unavailable, record the missing command and residual risk in `code-review.md` or `verification.md`.

## Key Constraints

- Work inside this repository.
- Preserve user changes.
- Keep task state on disk.
- Prefer small, reviewable changes.
- Do not skip review or verification gates.
```

### 4.10 `docs/product.md`

```markdown
# Product

## 1. Background and Terms

SharkBay is a local dashboard for managing software projects that use a file-based harness protocol. The project exists because switching between many sessions and repositories makes it hard to see what each project is doing, what phase each task is in, and what evidence exists for review or verification.

Key terms:

| Term | Meaning |
| --- | --- |
| Harness repo | A repository containing `.agent/`, `docs/`, and `tasks/` state files |
| Project root | A local directory SharkBay scans for repositories |
| Phase | The current lifecycle step for a task, such as `spec`, `design`, `coding`, or `verification` |
| Gate | A quality condition required before a task can advance |
| Evidence | Logs, command output, screenshots, traces, or scripts proving verification happened |

## 2. Product Summary

| Item | Value |
| --- | --- |
| One-line positioning | A local control panel for harness-enabled projects |
| Target users | Developers managing multiple local repos that follow file-based task protocols |
| Core workflow | Scan project roots, inspect project/task state, create harness repos, and generate next-action prompts |
| Value proposition | Reduce session switching by making project state, phase, gates, URLs, and verification evidence visible in one place |

## 3. User Problems

| User | Problem | Current workaround | Desired outcome |
| --- | --- | --- | --- |
| Solo developer | Too many sessions and repos to track mentally | Manually switch windows and read logs | One dashboard shows project/task state |
| Solo developer | Work is marked done without durable evidence | Search terminal history and notes | Verification evidence is saved and visible |
| Solo developer | New repo setup repeats the same harness boilerplate | Copy files manually | Create a harness repo from templates |
| Solo developer | Unsure what action should happen next | Reconstruct state from memory | Generate a next-action prompt from task state |

## 4. Functional Scope

| Priority | Feature | Description | Acceptance Criteria |
| --- | --- | --- | --- |
| P0 | Project root scanning | Scan configured local directories for harness repos | Finds repos with `.agent/manifest.json`; falls back to `.agent/protocol.md` |
| P0 | Dashboard | Show detected projects and current state | Displays name, path, branch, dirty state, active task, phase, and gate status |
| P0 | Project detail | Show queue, active task, lifecycle artifacts, and evidence | User can inspect task files without leaving the app |
| P0 | New harness repo wizard | Create a new project directory from bundled templates | Writes `.agent/`, `docs/`, `tasks/`, and machine-readable JSON |
| P1 | Next-action prompt | Generate a prompt for an agent or tool to advance a selected task | Prompt references repo path, task id, phase, and protocol |
| P1 | URL tracking | Store local, test, and deployment URLs | URLs appear in project dashboard and detail view |
| P2 | Direct agent/tool invocation | Advance tasks from the UI through an approved agent or tool | Requires explicit user approval and visible logs |

## 5. Non-Goals

- Multi-user collaboration in the first version.
- Cloud sync in the first version.
- Billing, accounts, or permissions.
- Remote code execution.
- Autonomous long-running background execution before the read-only dashboard and prompt generation are stable.

## 6. Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Markdown parsing is brittle | Dashboard may misread state | Use JSON mirrors as primary machine-readable state |
| Direct agent invocation is risky | Unintended file edits or long-running commands | Start with prompt generation; add execution later behind approval |
| Local filesystem access differs by platform | Scanning may fail | Start on macOS/local paths; isolate filesystem access behind a service |
| Scope expands into a full project management suite | MVP slows down | Keep v0 focused on harness repos and task lifecycle visibility |
```

### 4.11 `docs/architecture.md`

```markdown
# Architecture

## 1. Overview

SharkBay is a local-first web application with a browser UI and a local service that can scan configured project roots. The local service reads harness metadata from repositories and exposes normalized project/task state to the UI.

```text
User
  |
  v
Browser UI
  |
  v
Local SharkBay service
  |
  +--> Project root scanner
  |
  +--> Harness repo reader
  |
  +--> Template installer
  |
  +--> Prompt generator
  |
  v
Local filesystem repositories
```

## 2. Tech Stack

| Layer | Technology | Reason |
| --- | --- | --- |
| UI | TBD | Ask user; default recommendation can be React + TypeScript |
| Local service | TBD | Needs filesystem scanning and template writes |
| Storage | Local JSON/files | Project state already lives inside repos |
| Templates | Repository files | New harness repos are created from versioned templates |

## 3. Directory Structure

```text
.
├── app-or-ui TBD
├── service-or-server TBD
├── templates/
│   └── harness/
├── docs/
├── .agent/
└── tasks/
```

## 4. Module Boundaries

| Module | Responsibility | Must Not Do |
| --- | --- | --- |
| Scanner | Discover harness repos under configured roots | Modify repositories |
| Repo reader | Parse `.agent/manifest.json`, state, queue, and task files | Infer missing facts without marking uncertainty |
| Template installer | Create new harness repos from templates | Overwrite existing files blindly |
| Dashboard UI | Display project and task lifecycle state | Execute destructive repo operations |
| Prompt generator | Produce next-action prompts for agents or tools | Pretend execution happened |
| Runner, future | Invoke approved agents or tools with approval | Run without logs or user-visible evidence |

## 5. Data Flow

```text
Configured project roots
  -> scanner finds candidate repos
  -> repo reader loads .agent/manifest.json or fallback markers
  -> normalized project records
  -> dashboard list and detail views
  -> user selects project/task action
  -> prompt generator or template installer writes controlled outputs
```

## 6. Constraints

| Constraint | Reason | Source |
| --- | --- | --- |
| Prefer JSON for dashboard state | Markdown tables are fragile to parse | Harness protocol |
| Preserve repository files | SharkBay manages developer workspaces | Safety rule |
| Require evidence for verification | Avoid self-reporting without proof | Quality rules |
| Ask before direct execution | Agent/tool invocation can edit files or run commands | Approval rule |
```

### 4.12 `docs/roadmap.md`

```markdown
# Roadmap

## 1. Strategy

TBD

## 2. Phases

| Phase | Goal | Deliverables | Gate |
| --- | --- | --- | --- |

## 3. Milestones

| Milestone | Target | Exit Criteria |
| --- | --- | --- |

## 4. Dependencies

```text
TBD
```
```

### 4.13 `docs/task.md`

```markdown
# Tasks

## Current Stage

Bootstrap and MVP specification.

## Task List

| ID | Status | Title | Depends On | Notes |
| --- | --- | --- | --- | --- |
| `t-001-sharkbay-mvp-spec` | active | Define SharkBay MVP product, architecture, and implementation plan | none | Start at `spec`; do not code before design/contract |

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
t-001-sharkbay-mvp-spec
```
```

### 4.14 `docs/learnings.md`

```markdown
# Learnings

Record durable lessons here. Newest entries go first.

Use this format:

```markdown
### Short Title

**Problem**: What happened.

**Cause**: Why it happened.

**Solution**: What fixed it.

**Source**: Task, PR, command, or file reference.

---
```

Record:

- Issues that required research.
- Bugs that took multiple attempts.
- Platform or framework constraints.
- Repeated review findings that should become rules.

Do not record:

- Simple typos.
- Obvious syntax errors.
- One-off trivial fixes.
```

### 4.15 `scripts/README.md`

```markdown
# Scripts

This directory stores project-local automation that helps agents, tools, and humans verify work repeatably.

## Rules

- Prefer scripts for task-specific validation when existing test commands are not enough.
- Keep scripts small and named after the behavior they verify.
- Scripts should print clear pass/fail evidence.
- Scripts should return non-zero on failure.
- Scripts must not require secrets unless explicitly documented.
- Scripts must not mutate production data.

## Naming

Examples:

```text
scripts/verify-auth-flow.sh
scripts/check-fixtures.ts
scripts/inspect-build-output.mjs
```

## Recording Evidence

When a script is used for a task, record this in `tasks/<task-id>/verification.md`:

- Script command
- Exit code
- Output excerpt
- Any generated artifact path
```

### 4.16 `tasks/_template/status.md`

```markdown
# Task Status

## Metadata

| Field | Value |
| --- | --- |
| Task ID | TBD |
| Title | TBD |
| Priority | TBD |
| Phase | intake |
| Owner Role | Controller |
| Depends On | none |
| Created | TBD |
| Updated | TBD |

## Goal

TBD

## Scope

In scope:

- TBD

Out of scope:

- TBD

## Current Gate

| Gate | Status | Notes |
| --- | --- | --- |
| Dependencies | pending |  |
| Spec | pending |  |
| Design review | pending |  |
| Contract | pending |  |
| Code review | pending |  |
| Verification | pending |  |
| Docs update | pending |  |

## Next Action

TBD

## Open Questions

| Question | Blocks Phase | Owner |
| --- | --- | --- |

## History

| Date | Phase | Summary |
| --- | --- | --- |
```

### 4.17 `tasks/_template/spec.md`

```markdown
# Spec

## 1. User Goal

TBD

## 2. Problem

TBD

## 3. Requirements

| Priority | Requirement | Acceptance Criteria |
| --- | --- | --- |

## 4. Non-Goals

- TBD

## 5. Assumptions

- TBD

## 6. Open Questions

| Question | Impact | Proposed Default |
| --- | --- | --- |
```

### 4.18 `tasks/_template/design.md`

```markdown
# Design

## 1. Summary

TBD

## 2. Proposed Approach

TBD

## 3. Files and Modules

| File/Module | Change | Reason |
| --- | --- | --- |

## 4. Data/API/UI Impact

TBD

## 5. Edge Cases

| Case | Handling |
| --- | --- |

## 6. Risks

| Risk | Mitigation |
| --- | --- |

## 7. Verification Plan

TBD
```

### 4.19 `tasks/_template/design-review.md`

```markdown
# Design Review

## Summary

TBD

## Findings

| Severity | Finding | Required Change |
| --- | --- | --- |

## Gate Result

| Severity | Count |
| --- | --- |
| blocker | 0 |
| major | 0 |
| minor | 0 |
| note | 0 |

## Decision

- [ ] Pass
- [ ] Revise
```

### 4.20 `tasks/_template/contract.md`

```markdown
# Implementation Contract

## 1. Objective

TBD

## 2. In Scope

- TBD

## 3. Out of Scope

- TBD

## 4. Files Allowed to Change

| Path | Reason |
| --- | --- |

## 5. Done Criteria

- TBD

## 6. Required Checks

| Check | Command | Required |
| --- | --- | --- |

## 7. Cross-Validation Requirement

For critical logic, specify the test or validation script that must prove the behavior.

| Critical Behavior | Test/Script | Evidence Expected |
| --- | --- | --- |

## 8. Stop Conditions

Stop and ask the user if:

- Scope needs to expand.
- A required command cannot run.
- An architectural assumption is wrong.
- A risky or destructive action appears necessary.
```

### 4.21 `tasks/_template/implementation.md`

```markdown
# Implementation Notes

## Summary

TBD

## Changes

| Path | Summary |
| --- | --- |

## Decisions During Implementation

| Decision | Reason |
| --- | --- |

## Known Risks

| Risk | Follow-up |
| --- | --- |
```

### 4.22 `tasks/_template/code-review.md`

```markdown
# Code Review

## Summary

TBD

## Automation Evidence

Run required checks from `contract.md` before making a pass/revise decision.

| Check | Command | Exit Code | Evidence |
| --- | --- | --- | --- |

## Findings

| Severity | File | Finding | Required Change |
| --- | --- | --- | --- |

## Gate Result

| Severity | Count |
| --- | --- |
| blocker | 0 |
| major | 0 |
| minor | 0 |
| note | 0 |

## Decision

- [ ] Pass
- [ ] Revise
```

### 4.23 `tasks/_template/verification.md`

```markdown
# Verification

## Checks Run

| Check | Command | Exit Code | Result | Evidence |
| --- | --- | --- | --- | --- |

## Evidence Artifacts

| Type | Path | Notes |
| --- | --- | --- |

Examples: logs, screenshots, videos, traces, generated reports.

## Manual Verification

| Scenario | Steps | Observed Result | Evidence |
| --- | --- | --- | --- |

Manual verification alone is not enough for critical logic unless the user explicitly accepts it.

## Cross-Validation

| Critical Behavior | Test or Script | Result | Notes |
| --- | --- | --- | --- |

## Skipped Checks

| Check | Reason | Risk |
| --- | --- | --- |

## Result

- [ ] Pass
- [ ] Fail
```

### 4.24 `tasks/_template/decisions.md`

```markdown
# Decisions

| Date | Decision | Context | Alternatives |
| --- | --- | --- | --- |
```

## 5. Bootstrap Procedure

After creating the files:

1. Detect repository identity.
2. Apply the SharkBay project seed unless existing repository docs clearly override it.
3. Update `.agent/manifest.json`, `.agent/state.json`, `.agent/queue.json`, `.agent/state.md`, and `.agent/queue.md` with the current date and detected repository status.
4. If the repository has code, infer what already exists and merge it into `docs/product.md`, `docs/architecture.md`, and `docs/agents.md`.
5. If the repository is empty, use the SharkBay templates as the starting docs.
6. Create the first task folder `tasks/t-001-sharkbay-mvp-spec/` unless it already exists.
7. Copy the templates from `tasks/_template/` into that task folder and prefill `status.md` and `spec.md` from the SharkBay seed.
8. Do not start coding until the first task passes `spec`, `design`, and `contract`.

## 6. Repository Detection

Before asking the user for GitHub or repository information, inspect what is already available.

Check:

- Is the current directory inside a git repository?
- What is the git root?
- What is the current branch?
- What is the default branch, if discoverable?
- Is `remote.origin.url` configured?
- Does the origin URL point to GitHub?
- Is the worktree dirty?

Write the result to `.agent/state.md`.

Rules:

- If the directory is already a git repository and has a GitHub origin, do not ask for the GitHub repository URL.
- If the directory is a git repository but has no origin, ask the user for the intended remote URL.
- If the directory is not a git repository, ask whether the user wants to initialize git here.
- Do not run `git init`, create remotes, rename branches, or push without explicit user approval.
- If the user gives a GitHub URL, record it in `.agent/state.md` even if no remote is configured yet.

## 7. Intake Questions

Ask only the missing questions after bootstrap. Because this file is pre-seeded for SharkBay, do not ask what the project is unless existing files conflict with the seed.

Default answers from the seed:

1. Project: SharkBay.
2. Project type: local-first web app / developer tool.
3. First task: `t-001-sharkbay-mvp-spec`.
4. Starting phase: `spec`.

Questions to ask if still unknown:

1. What stack should SharkBay use, or should I propose a default?
2. Are there any files or directories I must not touch?
3. If no GitHub origin was detected: what is the intended GitHub repository URL, or should this stay local for now?
4. If this is not a git repository: should git be initialized here?
5. Should the first task stop after `spec`, or continue into `design` once the spec is drafted?

After the user answers:

1. Update `tasks/t-001-sharkbay-mvp-spec/status.md` and `spec.md`.
2. Add or update the task in `.agent/queue.json` and `.agent/queue.md`.
3. Update `.agent/state.json` and `.agent/state.md`.
4. Continue according to `.agent/protocol.md`.

## 8. How to Respond After Bootstrap

After scaffold creation, respond with:

- Files created.
- Files preserved or skipped.
- Detected project type, if any.
- Next questions for the user.
- The exact next command/prompt the user can give, for example:

```text
Create the first task from my answers and advance it through the spec phase.
```

Do not give a long conceptual explanation unless the user asks.
