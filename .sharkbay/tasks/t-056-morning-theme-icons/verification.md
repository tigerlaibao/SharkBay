# Verification

## Commands

| Check | Exit | Evidence |
| --- | ---: | --- |
| `identify -format ... resources/shark-morning.png resources/shark-day.png resources/shark-night.png` | 0 | All three PNGs reported `1024x1024 srgba`; `corner=srgba(0,0,0,0)` and center/top-mid pixels were opaque. |
| `file resources/shark-morning.icns resources/shark-day.icns resources/shark-night.icns` | 0 | All three files were recognized as `Mac OS X icon` files with `ic10` entries. |
| `sips -g pixelWidth -g pixelHeight resources/shark-morning.icns resources/shark-day.icns resources/shark-night.icns` | 0 | All three `.icns` files reported `pixelWidth: 1024` and `pixelHeight: 1024`. |
| `rg -n 'data-theme="classic"|theme-swatch-classic|"classic"|Classic' src electron package.json tests` | 0 | Only legacy migration references and the regression fixture remain. |
| `npm run typecheck` | 0 | TypeScript renderer and node projects completed with no errors. |
| `npm test` | 0 | 13 test files passed; 78 tests passed, including the new legacy `classic` to `morning` migration test. |
| `npm run build` | 0 | Vite production build completed; existing chunk-size warning remains. |
| `npm run pack` | 0 | Electron Builder packaged `release/mac-arm64/SharkBay.app`; existing author/rebuild/deprecation/notarization warnings remain. |
| `ls -lh release/mac-arm64/SharkBay.app/Contents/Resources/resources/shark-*.png` | 0 | Packaged app contains `shark-morning.png`, `shark-day.png`, and `shark-night.png`. |
| `git diff --check` | 0 | No whitespace errors. |

## Done Criteria Mapping

- Rename Classic to Morning: satisfied by shared/renderer type updates, Settings label update, CSS selector rename, and legacy normalization test.
- Use new Downloads icons: satisfied by regenerated Morning/Day/Night PNG and ICNS resources from the refreshed source files.
- Reduce oversized Dock icon appearance: satisfied by 1024 canvas with 880px centered rounded-rectangle visual content and transparent outer padding.
- Keep package viable: satisfied by build, pack, and packaged resource checks.

