# T-049 Contract

## Scope

Fix the packaged macOS app white-screen failure after launch.

## Done Criteria

- The packaged app loads the built renderer from the correct runtime location.
- The fix does not weaken Electron filesystem or IPC boundaries.
- Verification includes typecheck/build, packaged app launch evidence, and a smoke check that the renderer produces visible UI rather than a blank white window.

## Non-Goals

- No signing, notarization, release publishing, or installer distribution changes unless required to fix the white screen.
- No broad packaging refactor beyond the minimum needed for correct runtime loading.
