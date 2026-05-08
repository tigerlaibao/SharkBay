# Contract

## Scope

- Reduce the visual intensity of pill/tag styles in Night mode across project rows and detail panels.
- Keep semantic colors recognizable, but use translucent backgrounds, softer borders, and lower-contrast text.
- Make the fallback default project icon readable in Night mode without changing non-default project icons.
- Make bundled Shark project icons fill their circular project avatar better when they include transparent app-icon padding.
- Restore readable Night-mode contrast for the middle terminal header project name.

## Non-Goals

- Do not redesign Day or Morning theme pills.
- Do not replace the source `shark-fin.png` asset.
- Do not change project icon discovery behavior.
- Do not change the Dock/app icon geometry from T056.

## Verification

- Source checks confirm scoped Night/default-icon selectors, bundled Shark avatar scaling, and Night terminal heading contrast.
- `npm run typecheck`
- `npm test`
- `npm run build`
- `git diff --check`
