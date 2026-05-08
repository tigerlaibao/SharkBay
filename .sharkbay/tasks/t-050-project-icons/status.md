# t-050-project-icons Status

- Task ID: `t-050-project-icons`
- Title: Add project icons to the left project list
- Status: done
- Phase: done
- Priority: 1
- Created: 2026-05-08T10:32:14+08:00
- Depends on: none

## User Goal

Add a circular icon for each project in the left column. Use `~/Downloads/shark-fin.png` as the default icon, and choose project-specific icons from web favicons or app icons according to the project type when possible.

## Current Assumptions

- The first slice should not add network scraping or background downloading. Runtime should expose icon candidates that the renderer can load when safe.
- Local app icons are preferred for app-like projects when an icon file exists in common repo locations.
- Web favicons are preferred when project-authored metadata includes local, test, or deployment URLs.
- Missing, unavailable, or blocked icon sources fall back to the bundled shark fin image.

## Phase Log

- 2026-05-08T10:32:14+08:00: Opened task from user request and moved directly to contract because scope is narrow UI/data plumbing with no dependencies.
- 2026-05-08T10:38:02+08:00: Implemented project icon source resolution and circular left-list rendering.
- 2026-05-08T10:38:02+08:00: Code review passed with blocker=0 and major=0.
- 2026-05-08T10:38:02+08:00: Verification passed; automated screenshot was unavailable because `agent-browser` was not installed and Computer Use app listing failed with Apple event error `-1743`.
