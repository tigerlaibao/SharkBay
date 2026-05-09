# Implementation

## Changes

- Added `gitDirtyFiles` to project detail reads using `git status --porcelain=v1 -uall`.
- Added compact dirty-file parsing coverage in `tests/git.test.ts`.
- Removed Files tab/file/folder glyph rendering and deleted the unused CSS icon rules.
- Replaced fixed `nano -- <path>` terminal launch with `if command -v vim ...; then vim -- <path>; else nano -- <path>; fi`.
- Added dirty file rows below the Git tab Repository panel; double-click opens a new safe project-rooted terminal tab with git diff commands for unstaged, staged, and untracked changes.
- Adjusted task detail header CSS so the task title block sits below the back button.
- Tightened Repository facts spacing and font sizes.

## Notes

- Confirmed this system has `vim` at `/opt/homebrew/bin/vim`.
- Existing terminal cwd validation remains the authority boundary for editor and diff tabs.

