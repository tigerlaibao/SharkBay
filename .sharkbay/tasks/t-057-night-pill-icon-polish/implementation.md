# Implementation

## Changes

- Added an `is-default` class to `ProjectIcon` only when the fallback `shark-fin.png` asset is used.
- Added Night-only CSS that lightens and softens the fallback icon through filter and opacity, without touching real project icons.
- Added Night-only pill/tag overrides for phase, status, runner, worktree, and harness pills.
- Kept semantic colors but made them translucent and less saturated against the dark Night palette.
- Scaled fallback and bundled Shark app-icon images inside the circular project avatar so transparent icon padding does not make them look undersized.
- Added Night-only terminal layout/header title colors so the middle column project name remains readable.

## Files

- `src/renderer/App.tsx`
- `src/styles/app.css`
