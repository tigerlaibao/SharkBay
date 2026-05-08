# Contract

## Scope

- Rename the app appearance theme formerly called `classic` to `morning` in user-facing Settings UI, renderer theme state, shared config types, CSS selectors, and Electron runtime icon selection.
- Preserve backward compatibility for existing saved configs that contain the old `classic` value by normalizing it to `morning`.
- Use the refreshed images in `~/Downloads/shark_morning.png`, `~/Downloads/shark_day.png`, and `~/Downloads/shark_night.png` to create bundled `resources/shark-morning.*`, `resources/shark-day.*`, and `resources/shark-night.*` app icon assets.
- Regenerate icons as macOS-style rounded-rectangle app icons on a 1024x1024 canvas, with centered artwork and transparent outer padding so the Dock/runtime PNG no longer reads oversized next to other app icons.
- Update project icon fallback candidates so the Morning app icon is available where relevant.

## Non-Goals

- Do not redesign the Morning/Day/Night color palettes beyond the rename.
- Do not change the default selected theme unless required for compatibility.
- Do not add a new icon-generation pipeline dependency.

## Assumptions

- `classic` remains a legacy config value only; user-facing and current persisted values should be `morning`.
- The Electron development/runtime icon still uses PNG alpha directly, so the PNG resources need their own rounded-rectangle alpha and visual-size correction.
- Apple’s official guidance is used as design input, but a small runtime-specific transparent margin is acceptable to compensate for Electron’s direct PNG icon display.

## Verification

- `rg -n "classic|Classic" src electron package.json` shows only explicit legacy config normalization references to the old theme value.
- Icon file checks confirm 1024x1024 PNGs with transparent corners and opaque centered artwork for all three state icons, plus valid `.icns` files.
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run pack`
- `git diff --check`
