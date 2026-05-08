# Implementation

## Changes

- Renamed the current theme value from `classic` to `morning` across shared types, renderer Settings UI, terminal theme selection, CSS `data-theme` selectors, and Electron runtime Dock icon selection.
- Kept backward compatibility for old saved config values by mapping `classic` to `morning` in both main-process config normalization and renderer config normalization.
- Added `resources/shark-morning.png` and `resources/shark-morning.icns`.
- Regenerated `resources/shark-day.*` and `resources/shark-night.*` from the refreshed Downloads assets.
- Added the Morning PNG to project icon fallback discovery.

## Icon Geometry

- Source files:
  - `/Users/shark/Downloads/shark_morning.png`
  - `/Users/shark/Downloads/shark_day.png`
  - `/Users/shark/Downloads/shark_night.png`
- Generated PNGs use a 1024x1024 transparent canvas.
- Artwork is center-cropped into an 880x880 rounded rectangle at 72px inset, with no circular inner badge or extra circle-on-board treatment.
- This keeps the icon visually smaller in Electron’s direct PNG Dock path while preserving macOS-style rounded-rectangle presentation.

## Evidence So Far

- `identify -format ... resources/shark-*.png` showed all three generated PNGs are `1024x1024 srgba`, with transparent corner pixels and opaque center/top-mid pixels.
- `file resources/shark-*.icns` recognized all three `.icns` files as Mac OS X icon files with `ic10` entries.
- `sips -g pixelWidth -g pixelHeight resources/shark-*.icns` reported `1024x1024` for all three `.icns` files.
- `rg -n "classic|Classic" src electron package.json` now reports only legacy config normalization references.

