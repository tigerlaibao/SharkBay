# T-074 Files Tab Nano Open

- Status: done
- Phase: done
- Created: 2026-05-09T12:14:05+08:00
- Updated: 2026-05-09T12:21:21+08:00
- Depends on: none
- User goal: Add a right-column Files tab that lists every file in the selected project as a tree; double-clicking an editable file opens a new terminal tab and runs `nano` for that file.
- Current action: Complete.
- Blocked by: none

## Phase Log

- 2026-05-09T12:14:05+08:00: Registered ad-hoc user request as active task and opened coding with a narrow implementation contract.
- 2026-05-09T12:21:21+08:00: Implemented Files tab, safe file tree IPC, nano terminal launch, focused tests, docs, review, and verification.

## Done Criteria

- [x] Right detail tabs include `FILES` alongside existing project tabs.
- [x] Files tab renders a tree of files under the selected project path without exposing paths outside configured roots.
- [x] Double-clicking editable files opens a new project terminal tab and runs `nano` against the selected file.
- [x] Non-editable files do not launch `nano`.
- [x] Verification evidence is recorded.
