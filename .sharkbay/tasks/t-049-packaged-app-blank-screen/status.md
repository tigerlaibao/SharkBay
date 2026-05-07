# T-049: Fix Packaged macOS App Blank Screen

- Status: done
- Phase: done
- Priority: 1
- Depends on: none
- Opened: 2026-05-07T20:29:37+08:00
- Source: user report that the packaged app launches to a blank white screen

## Current Goal

Find and fix why the electron-builder packaged macOS app shows a blank white window after launch.

## Assumptions

- "打包完的app" refers to the `release/mac*/SharkBay.app` artifact produced by the current electron-builder packaging scripts.
- The dev and Vite build paths were previously verified; this task focuses on production packaged runtime behavior.

## Outcome

Fixed packaged runtime path handling:

- Vite now emits relative renderer asset URLs so `BrowserWindow.loadFile()` can load bundled JS/CSS from `file://`.
- Project detail reads now use the Electron runtime template root, preventing Finder-launched packaged apps from falling back to `/templates/harness`.

## Verification

See `verification.md`.
