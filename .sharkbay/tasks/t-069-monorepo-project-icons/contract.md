# t-069-monorepo-project-icons Contract

## Scope

- Extend project icon discovery to include common frontend package asset locations such as `packages/web/public/favicon.ico` and `packages/web/public/icon-512.png`.
- Preserve the existing ordering where root semantic project icons remain highest priority.
- Keep icon handling read-only: no downloads, caches, or writes to managed projects.

## Non-Goals

- Do not modify the ItsMyLife repository.
- Do not introduce network favicon crawling or persistent favicon storage.
- Do not change project row rendering or avatar CSS.

## Done Criteria

- Focused scanner test proves a monorepo web public icon is discovered as a local icon source.
- Existing project icon tests still pass.
- A real scan of `/Users/shark/Projects/ItsMyLife` returns a local icon source before favicon URL sources.
