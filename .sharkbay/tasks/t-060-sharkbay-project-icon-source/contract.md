# Contract

## Scope

- Change project icon discovery so project rows prefer semantic project icon paths such as `resources/project-icon.png`, not theme-specific macOS app-icon resources with transparent visual padding.
- Add a SharkBay `resources/project-icon.png` asset sourced from the full project artwork, so the project row has a semantic avatar source without a SharkBay-specific code branch.
- Leave Dock/runtime app icon resources and theme switching unchanged.
- Preserve fallback behavior through existing generic paths and the renderer fallback icon.

## Verification

- Source check confirms `commonIconPaths` contains semantic project icon paths and no `resources/shark-*` or `resources/shark.png` project-avatar candidates.
- Image check confirms `resources/project-icon.png` exists.
- `npm run typecheck`
- `npm test`
- `npm run build`
- `git diff --check`
