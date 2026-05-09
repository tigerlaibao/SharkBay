# Implementation Contract

## Scope

- Exclude terminal tabs with `session.service` from project-level terminal activity aggregation used by left project row `working` / `idle` labels.
- Preserve non-service terminal tabs as the only source for those labels.
- Preserve service running dots and service start/stop behavior.

## Assumptions

- Service tabs can still display their own terminal tab state if they receive output.
- The request targets project-level `working` / `idle` labels, not the blue service-running indicators.

## Non-Goals

- Do not change service discovery or commands.
- Do not change terminal process lifecycle.
- Do not redesign terminal tabs or project rows.

## Done Criteria

- A project with only service tabs does not show a left-row `working` or `idle` activity label.
- A project with a non-service working/done tab still shows the expected label, even if service tabs also exist.
- Service running indicators still derive from service tabs.
- Verification commands pass.
