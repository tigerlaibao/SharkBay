# T-049 Implementation

## Changes

- Set Vite `base` to `./` so packaged `dist/renderer/index.html` references `./assets/...` instead of `/assets/...` under `file://`.
- Updated `readProjectDetail`'s runtime overload to pass `runtime.templateRoot` into template sync summary reads.
- Added regression tests for packaged renderer asset configuration and runtime template-root project detail reads.

## Notes

The second issue was visible only from packaged/Finder-style runtime because `process.cwd()` can be `/`, causing the old fallback to resolve templates as `/templates/harness`.
