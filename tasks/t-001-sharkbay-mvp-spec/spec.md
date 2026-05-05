# Spec

## 1. User Goal

Define the SharkBay MVP product, architecture, and implementation plan for a macOS local app before coding begins.

## 2. Problem

Developers managing many local AI-assisted repositories need a durable way to see repository state, active tasks, lifecycle phases, gate status, URLs, and verification evidence without mentally reconstructing state from many chat sessions and terminal histories. SharkBay should feel like a local macOS control panel, while still using explicit user-configured directories as its safety boundary.

SharkBay must be developed under the same harness it will later manage. This repository is both the app's source code and the first concrete example of a managed project.

## 3. Requirements

| Priority | Requirement | Acceptance Criteria |
| --- | --- | --- |
| P0 | Scan local project roots | User can configure one or more local root directories; SharkBay discovers harness repos under them. |
| P0 | Respect configured directory boundaries | SharkBay only scans and manages directories explicitly configured in the app. |
| P0 | Detect harness repositories | Repos with `.agent/manifest.json` are detected; repos with `.agent/protocol.md` are detected as fallback with uncertainty recorded. |
| P0 | Self-manage SharkBay repo | When this repository is under a configured root, SharkBay detects itself as project `SharkBay` and displays task `t-001-sharkbay-mvp-spec` in phase `spec`. |
| P0 | Show project dashboard | Dashboard displays project name, path, repo URL, current branch, dirty state, active task, phase, gate status, local URL, and deployment URL when available. |
| P0 | Show project detail | Detail view displays queue, active task, lifecycle phase, review findings, verification evidence, and recent decisions. |
| P0 | Create harness repo from templates | User can create a new repository directory with `.agent/manifest.json`, `.agent/state.json`, `.agent/queue.json`, docs, and task templates. |
| P0 | Maintain machine-readable state | SharkBay writes `.agent/manifest.json`, `.agent/state.json`, and `.agent/queue.json` without overwriting user work blindly. |
| P1 | Generate next-action prompt | User can copy a prompt for Codex that references selected repo path, task id, phase, and protocol. |
| P1 | Track URLs | Local, test, and deployment URLs are stored and visible in dashboard/detail views. |

## 4. Non-Goals

- Full autonomous background execution.
- Direct multi-agent orchestration.
- Cloud sync or multi-user collaboration.
- Production deployment automation.
- Billing, accounts, or permissions.
- Remote code execution.

## 5. Assumptions

- SharkBay runs locally on the developer's machine.
- SharkBay is dogfooded on its own repository from the beginning.
- The first supported environment is macOS/local filesystem paths.
- Recommended stack is Electron + React + TypeScript + Vite unless the user chooses a lighter but more complex native stack.
- JSON harness files are the primary machine-readable state.
- Markdown files remain useful for human and AI context.
- Direct Codex invocation should be deferred until dashboard and prompt generation are stable.

## 6. Decisions

| Decision | Rationale | Status |
| --- | --- | --- |
| Use Electron + React + TypeScript + Vite for the MVP. | This is the least surprising path for a first macOS app that needs Node filesystem access, git inspection, and a rich dashboard UI. | Accepted default |
| Configure repository origin as `git@github.com:SharkUI/sharkbay.git`. | User provided the GitHub repository URL and approved git setup. | Done |
| Continue from spec into design. | User asked to keep advancing after the self-hosting clarification. | Done |

## 7. Spec Gate

| Gate Requirement | Result | Evidence |
| --- | --- | --- |
| Scope is clear | pass | P0/P1 requirements and non-goals are listed above. |
| Non-goals are listed | pass | Deferred automation, orchestration, cloud sync, deployment automation, accounts, and remote execution are out of scope. |
| Acceptance criteria exist | pass | Each MVP requirement has acceptance criteria. |
