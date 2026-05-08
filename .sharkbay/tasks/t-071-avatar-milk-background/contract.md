# t-071-avatar-milk-background Contract

## Scope

- Set project avatar circle background to the same milk-white family as project rows in normal themes.
- Set Night mode avatar circle background to a translucent milk-white value.
- Keep changes scoped to avatar circle styling.

## Non-Goals

- Do not change icon discovery or source ordering.
- Do not change project row layout or sizes.
- Do not modify managed project icon assets.

## Done Criteria

- CSS source check shows base `.project-icon` uses milk-white background.
- CSS source check shows Night `.project-icon` uses an rgba translucent milk-white background.
- Build and diff checks pass.
