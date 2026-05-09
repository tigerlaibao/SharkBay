# Implementation Contract

## Scope

- Remove file/folder glyphs from the Files tab tree while preserving plus/minus expand controls.
- Change editable file launch command from fixed `nano` to `vim` with a `nano` fallback when `vim` is unavailable.
- Move task detail title onto the line below the back button by adjusting the task detail header structure.
- Make the Git tab Repository facts panel more compact.
- Add a compact dirty file list below the Repository panel.
- Double-clicking a dirty file opens a project-rooted terminal tab running a diff command for that file.

## Assumptions

- "Pepository" means the existing Git tab `Repository` panel.
- Dirty files come from `git status --porcelain=v1 -uall`; untracked files should be listed too.
- Diff terminal tabs may use git diff commands and remain inside the same safe project-root terminal authority boundary.

## Non-Goals

- No staging/unstaging/discard actions.
- No file content editing outside terminal-based `vim`/`nano`.
- No new filesystem authority beyond existing configured-root terminal and project detail reads.

## Done Criteria

- Files rows show names and expand controls without file/folder icons.
- Double-click editable Files entries opens `vim` when available and falls back to `nano`.
- Task detail title appears beneath the back button.
- Git Repository facts are visibly denser.
- Git tab shows dirty files below Repository when present, and double-clicking one opens a diff terminal tab.
- Typecheck, build, focused tests, and diff whitespace checks pass.

