# Verification

## Result

Passed. A fresh local macOS `.app` artifact was generated from the current repository state.

## Evidence

### `npm run pack`

- Exit code: 0
- Output excerpt:

```text
> sharkbay@0.1.0 pack
> npm run build && electron-builder --mac --dir

vite v5.4.21 building for production...
✓ built in 498ms
  • packaging       platform=darwin arch=arm64 electron=29.4.6 appOutDir=release/mac-arm64
  • falling back to ad-hoc signature for macOS application code signing
  • signing         file=release/mac-arm64/SharkBay.app platform=darwin type=distribution identityName=- identityHash=none provisioningProfile=none
  • skipped macOS notarization  reason=`notarize` options were unable to be generated
```

### Artifact Checks

- `test -d release/mac-arm64/SharkBay.app && printf 'exists\n'`
  - Exit code: 0
  - Output: `exists`
- `ls -ld release/mac-arm64/SharkBay.app release/mac-arm64/SharkBay.app/Contents release/mac-arm64/SharkBay.app/Contents/MacOS/SharkBay`
  - Exit code: 0
  - Output excerpt: `release/mac-arm64/SharkBay.app/Contents/MacOS/SharkBay`
- `du -sh release/mac-arm64/SharkBay.app`
  - Exit code: 0
  - Output: `242M release/mac-arm64/SharkBay.app`
- `/usr/libexec/PlistBuddy -c 'Print :CFBundleName' -c 'Print :CFBundleVersion' -c 'Print :CFBundleIdentifier' release/mac-arm64/SharkBay.app/Contents/Info.plist`
  - Exit code: 0
  - Output:

```text
SharkBay
0.1.0
xyz.sharkbay.app
```

- `codesign --verify --deep --strict release/mac-arm64/SharkBay.app`
  - Exit code: 0
  - Output: none

## Artifact

- `release/mac-arm64/SharkBay.app`

## Notes

- The artifact is ad-hoc signed and not notarized, matching the current local packaging configuration.
- Build output remains in the ignored `release/` directory.
