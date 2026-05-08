# t-070-favicon-first-monorepo-icons Contract

## Scope

- Keep explicit semantic project avatars such as `resources/project-icon.png` highest priority.
- Prefer committed favicon files inside monorepo web public asset directories before `apple-touch-icon.png`, `icon-512.png`, or `logo.png`.
- Preserve read-only icon resolution behavior.

## Non-Goals

- Do not change project row rendering or avatar CSS.
- Do not modify managed projects such as ItsMyLife.
- Do not change remote/runtime favicon URL generation.

## Done Criteria

- Focused scanner test proves `packages/web/public/favicon.ico` wins over `packages/web/public/icon-512.png`.
- Typecheck and scanner tests pass.
- Real ItsMyLife scan returns local `favicon.ico` before other icon candidates.
