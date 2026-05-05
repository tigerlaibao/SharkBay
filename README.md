# SharkBay

SharkBay is a local-first macOS workbench for managing AI-assisted software projects.

It reads lightweight project metadata from local repositories, shows task and verification state in one place, and helps generate next-action prompts for coding agents that follow a file-based workflow.

## What It Does

- Scans user-configured local folders for harness-enabled projects.
- Reads project state from `.agent/`, `docs/`, and `tasks/`.
- Shows active tasks, queues, lifecycle phase, recent decisions, Git status, and verification artifacts.
- Creates or sets up managed projects from bundled Ripple harness templates.
- Generates next-action prompts that tell an agent what files to read and which phase to advance.
- Keeps filesystem access scoped to configured roots.

## Project Model

SharkBay expects managed projects to use a small file-based harness:

- `AGENTS.md` for agent entrypoint instructions.
- `.agent/manifest.json` for project identity.
- `.agent/state.json` and `.agent/queue.json` for machine-readable state.
- `.agent/state.md` and `.agent/queue.md` for human-readable mirrors.
- `docs/` for durable product, architecture, task, and learning records.
- `tasks/<task-id>/` for phase artifacts, reviews, verification evidence, and decisions.

The app is intentionally local-first. Project data stays in local repository files unless the user chooses to publish the repository.

## Tech Stack

- Electron
- React
- TypeScript
- Vite
- Vitest

## Requirements

- Node.js `>=20.11`
- npm
- macOS for the desktop app workflow

## Development

Install dependencies:

```bash
npm install
```

Run the development app:

```bash
npm run dev
```

Run checks:

```bash
npm run typecheck
npm test
npm run build
```

`npm run lint` currently delegates to `npm run typecheck`.

## Safety Notes

SharkBay is designed around explicit local boundaries:

- It scans only folders configured by the user.
- Runtime services load configured roots from app config rather than trusting renderer-provided authority.
- Existing managed repositories are updated only through narrow harness JSON writes.
- Template installation rejects non-empty targets and symlink escapes.
- Direct agent execution is treated as a future capability that requires explicit approval and visible logs.

## Repository Status

This repository is also a managed SharkBay project. The included `.agent/`, `docs/`, and `tasks/` files are part of the product dogfood loop and demonstrate the harness format that SharkBay reads.

