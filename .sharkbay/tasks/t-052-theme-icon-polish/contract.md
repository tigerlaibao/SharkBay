# t-052-theme-icon-polish Contract

## Scope

- Regenerate day/night PNG and ICNS resources with macOS-style rounded rectangle alpha while keeping the provided artwork full-bleed inside the shape.
- Make day-mode terminal chrome and xterm palette warm/light enough to fit the original app palette without becoming plain white.
- Make night mode less blue and closer to the original terminal's dark teal palette.
- Cover known missed night-mode surfaces, especially project rows and detail tab cards/buttons.

## Non-Goals

- No new automatic theme modes.
- No per-project terminal palette customization.
- No broad layout redesign.

## Done Criteria

- Electron runtime PNG icons have rounded transparent corners.
- Packaged ICNS resources are valid and reflect the rounded full-bleed artwork.
- Day and night terminal containers and xterm themes match their app palettes.
- Night-mode project rows and right detail tabs no longer retain light-mode surfaces.
- Verification commands pass or residual risk is recorded.
