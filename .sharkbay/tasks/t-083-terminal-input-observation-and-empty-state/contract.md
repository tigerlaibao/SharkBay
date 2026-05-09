# Implementation Contract

## Scope

- Track recent user terminal input per tab in the renderer.
- Reset/postpone the output observation window when input arrives so input echoes do not accumulate into `working`.
- Preserve sustained-output detection for command output after typing stops.
- Keep the `No terminal open` empty state inside the terminal content area, below the tab row.

## Assumptions

- Renderer-side xterm input events are enough to identify user typing for the tab.
- Input should not clear an existing yellow `idle`/done state unless the existing tab receives output or is clicked through the current behavior.
- The empty state should reuse the normal terminal space structure so the tab row keeps its own reserved area.

## Non-Goals

- No main-process terminal semantic parsing.
- No command-specific detection.
- No visual redesign beyond the empty-state placement fix.

## Done Criteria

- Continuous user input does not cause a tab to become `working`.
- Output after user input starts a fresh observation window.
- The empty terminal message does not overlap or intrude into the terminal tab row.
- Typecheck, build, and diff whitespace checks pass.
