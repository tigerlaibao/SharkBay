# SharkBay

SharkBay is a local-first macOS workbench for managing harness-enabled software projects.

It reads lightweight project metadata from local repositories, shows task, runner, Git, and verification state in one place, opens project-rooted terminal spaces, and helps generate next-action prompts for agents or tools that follow a file-based workflow.

## What It Does

- Scans user-configured local folders for harness-enabled projects.
- Reads project state from contained `.sharkbay/` harnesses and legacy `.agent`/root `docs`/root `tasks` harnesses.
- Shows active tasks, queues, lifecycle phase, recent decisions, Git status, and verification artifacts.
- Tracks runner lifecycle separately from task phase through optional harness runner heartbeat metadata.
- Presents project detail as focused Tasks, Decisions, Git, and Info tabs.
- Creates or sets up managed projects from bundled Ripple harness templates.
- Generates next-action prompts that tell an agent what files to read and which phase to advance.
- Opens per-project terminal workspaces backed by xterm and `node-pty`, with tabs titled from runtime cwd or foreground commands.
- Keeps workbench columns resizable and preserves terminal sessions while Settings is open.
- Keeps filesystem access scoped to configured roots.

## Project Model

SharkBay expects managed projects to use a small file-based harness:

- `AGENTS.md` for agent entrypoint instructions.
- `.sharkbay/manifest.json` for project identity.
- `.sharkbay/state.json` and `.sharkbay/queue.json` for machine-readable state.
- `.sharkbay/state.md` and `.sharkbay/queue.md` for human-readable mirrors.
- `.sharkbay/docs/` for durable product, architecture, task, and learning records.
- `.sharkbay/tasks/<task-id>/` for phase artifacts, reviews, verification evidence, and decisions.
- `.sharkbay/runner.json` for optional local runner lease and heartbeat state.
- `.sharkbay/development.json` for optional stable project-authored development metadata.

The app is intentionally local-first. Project data stays in local repository files unless the user chooses to publish the repository.

SharkBay still reads legacy projects that use `.agent/`, root `docs/`, and root `tasks/`. New setup uses the contained `.sharkbay/` layout to minimize interference with external projects. For legacy projects, the detail view can offer an explicit confirmed migration that moves only recognized harness files into `.sharkbay/`; it does not touch `.gitignore` or unrelated root `docs`/`tasks` content.

The bundled source templates for that harness live in `templates/harness/` and are part of the public product repository. SharkBay's own local dogfood harness state under root `.agent/`, root `tasks/`, `docs/task.md`, and `docs/learnings.md` is intentionally ignored so forked copies do not inherit this repository's private work queue or run history.

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
- Native build tooling required by Electron native modules, including `node-pty`

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

If Electron or native terminal dependencies change, rebuild native modules:

```bash
npm run rebuild:native
```

## Packaging

Create an unpacked local macOS app for smoke testing:

```bash
npm run pack
```

Create distributable macOS artifacts:

```bash
npm run dist
```

Outputs are written to `release/`, including `release/mac-arm64/SharkBay.app`, a DMG, and a zip archive. Local builds use ad-hoc signing unless signing/notarization credentials are configured.

## Safety Notes

SharkBay is designed around explicit local boundaries:

- It scans only folders configured by the user.
- Runtime services load configured roots from app config rather than trusting renderer-provided authority.
- Existing managed repositories are updated only through narrow harness JSON writes.
- Template installation rejects non-empty targets and symlink escapes.
- Terminal sessions are spawned only after the main process resolves the requested cwd inside configured roots.
- Direct agent execution is treated as a future capability that requires explicit approval and visible logs.

## Repository Status

This repository can be managed by SharkBay locally, but its root `.agent/` and `tasks/` state are not part of the public source tree. Use `templates/harness/` as the canonical example of the contained files SharkBay installs into other projects.
