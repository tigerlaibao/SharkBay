# t-052-theme-icon-polish Verification

## Checks

| Check | Exit | Evidence |
| --- | ---: | --- |
| `file resources/shark-day.png resources/shark-night.png resources/shark-day.icns resources/shark-night.icns` | 0 | PNGs reported 1024x1024 RGBA; ICNS files reported `Mac OS X icon`, `ic10` type. |
| `sips -g pixelWidth -g pixelHeight -g hasAlpha resources/shark-day.png resources/shark-night.png resources/shark-day.icns resources/shark-night.icns` | 0 | All four resources are 1024x1024 and have alpha. |
| `magick resources/shark-day.png -format "%[pixel:p{0,0}] %[pixel:p{120,120}] %[pixel:p{512,512}]\n" info:` | 0 | Corner pixel is `srgba(0,0,0,0)`; interior pixels are opaque artwork colors. |
| `npm run typecheck` | 0 | Renderer and node TypeScript projects passed. |
| `git diff --check` | 0 | No whitespace errors. |
| `npm run build` | 0 | Vite production build completed. |
| `npm test` | 0 | 13 test files passed, 77 tests passed. |
| `npm run pack` | 0 | electron-builder packaged `release/mac-arm64/SharkBay.app` successfully. |
| `file release/mac-arm64/SharkBay.app/Contents/Resources/icon.icns` | 0 | Packaged app icon reported `Mac OS X icon`, `ic10` type. |
| `sips -g pixelWidth -g pixelHeight -g hasAlpha release/mac-arm64/SharkBay.app/Contents/Resources/icon.icns` | 0 | Packaged app icon is 1024x1024 and has alpha. |
| `rg` scan for removed blue night palette hex values | 1 | No matches remained in theme source files. |

## Outcome

Verification passed. Icon shape, day terminal palette, night terminal palette, and missed night-mode UI surfaces were polished.
