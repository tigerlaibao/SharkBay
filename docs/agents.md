# AI Assistant Guide

This file provides guidance to AI coding assistants when working in this repository.

## Project Overview

- Product: SharkBay
- Project type: local-first macOS app / developer tool
- Current phase: MVP foundation implemented

## Required Reading

Start with:

- `AGENTS.md` - repository entry point
- `.agent/manifest.json` - machine-readable project identity
- `.agent/state.json` - machine-readable repository state
- `.agent/queue.json` - machine-readable task queue
- `.agent/runner.json` - optional cooperative runner lifecycle and heartbeat
- `.agent/protocol.md` - controller workflow
- `.agent/queue.md` - human-readable task queue
- `.agent/state.md` - human-readable repository state
- `docs/product.md` - product requirements
- `docs/architecture.md` - architecture and module boundaries
- `docs/task.md` - human-readable task list
- `docs/learnings.md` - durable lessons
- `scripts/README.md` - validation script conventions

## Development Commands

| Action | Command |
| --- | --- |
| Install dependencies | `npm install` |
| Start dev server | `npm run dev` |
| Run lint/static check | `npm run lint` |
| Run typecheck | `npm run typecheck` |
| Run tests | `npm test` |
| Build | `npm run build` |
| Check whitespace | `git diff --check` |

## Automation Scripts

Use `scripts/` for project-local validation helpers that make AI verification repeatable.

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
- SharkBay itself must only manage directories configured by the user inside the app.
- Runtime IPC/service entry points must treat persisted configured roots as authoritative; renderer-supplied roots are not trusted.
- Existing managed repo writes must go through narrow typed harness JSON patches with revision checks, schema validation, path containment, and atomic write behavior.
- Preserve user changes.
- Keep task state on disk.
- Keep runner lifecycle on disk while physically working: write `status=running`, refresh `heartbeatAt`, and set `waiting_for_human`, `blocked`, or `idle` when stopping.
- Prefer small, reviewable changes.
- Do not skip review or verification gates.
