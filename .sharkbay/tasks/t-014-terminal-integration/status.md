# Task Status

## Metadata

| Field | Value |
| --- | --- |
| Task ID | `t-014-terminal-integration` |
| Title | Integrate project terminal tabs |
| Priority | 1 |
| Phase | done |
| Owner Role | Controller |
| Depends On | `t-013-task-detail-drilldown` |
| Created | 2026-05-06 |
| Updated | 2026-05-06 |

## Goal

Replace the old global left navigation with a project-first workbench that adds a right-side Terminal column. Selecting any project candidate should keep tasks in the middle column and open a terminal session rooted at the selected project path.

## Current Gate

Done.

## Next Action

Ready for the next task.

## Blockers

None.

## Outcome

Implemented project terminal tabs. SharkBay now uses a three-column workbench with projects on the left, task/detail content in the middle, and terminal tabs on the far right. Terminal sessions validate cwd against configured roots and spawn in the selected managed or not-setup project directory.

## Verification Summary

- `npm run typecheck` passed.
- `npm test` passed with 9 files / 49 tests.
- `npm run build` passed.
- `git diff --check` passed.
- Browser smoke confirmed the three-column layout and terminal pane on `http://127.0.0.1:5173/`.
