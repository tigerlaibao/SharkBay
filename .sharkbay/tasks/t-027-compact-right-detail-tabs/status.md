# Compact right detail tabs

- Task ID: `t-027-compact-right-detail-tabs`
- Priority: 1
- Phase: done
- Status: done
- Depends on: none
- Opened: 2026-05-06T21:07:29+08:00
- Owner: Codex

## User Goal

Make the four tabs at the top of the right detail column visually simpler and more space-efficient, match their text size to the left sidebar `MANAGED` heading, and remove the horizontal divider above `NOT SETUP`.

## Scope

- In scope: right detail tab strip styling and the left `NOT SETUP` section divider.
- Out of scope: tab behavior, ARIA wiring, tab persistence, right detail content, terminal tabs, data loading, and public harness cleanup work.

## Assumptions

- Keep the existing four tab labels and keyboard behavior.
- Replace the card-like visual treatment with a compact tab-strip treatment.
- Match tab typography to the left sidebar section heading scale.
- Do not touch the staged `t-026-public-harness-cleanup` cleanup changes except local harness metadata needed to record this interruption.

## Verification Plan

- Run `npm run typecheck`.
- Run `npm run build`.
- Run `git diff --check`.
- Start a local dev server and visually check the right detail tabs.

## Outcome

- Completed: 2026-05-06T21:10:09+08:00
- Right detail tabs now render as a compact top tab strip.
- Active state uses a bottom rule instead of a filled card block.
- Tab typography now matches the left sidebar section heading scale and weight.
- The horizontal divider above `NOT SETUP` was removed.
- Commit: `6df7a30 Compact right detail tabs`.

## Verification Summary

- `npm run typecheck`: passed.
- `npm run build`: passed.
- `git diff --check`: passed.
- Running Electron/Vite app visual check: passed.
