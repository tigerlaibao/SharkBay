# Contract

## Scope

- Remove visible numeric counts from the left sidebar `Managed` and `Not setup` section headers.
- Move the new terminal tab `+` control from the terminal header actions into the terminal tabs row.
- Keep the `+` control at the far right of the tabs row and preserve disabled state when no project can open a terminal.

## Non-Goals

- No changes to project scanning, setup state, terminal backend behavior, or tab lifecycle.
- No redesign of terminal tab titles, close behavior, or project row content.

## Implementation Plan

- Update `src/renderer/App.tsx` where project section headers and terminal controls render.
- Update `src/styles/app.css` so the tabs row can hold the right-aligned add button.
- Preserve existing accessible labels and button semantics.

## Verification

- `npm run typecheck`
- `npm run build`
- `git diff --check`

## Gate

- Design/contract gate: blocker=0, major=0. Scope is narrow, assumptions are explicit, and verification commands are mapped to the done criteria.
