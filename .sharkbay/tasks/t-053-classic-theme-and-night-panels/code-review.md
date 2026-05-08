# t-053-classic-theme-and-night-panels Code Review

## Findings

- blocker: 0
- major: 0

## Review Notes

- `classic` is normalized explicitly in both main and renderer config handling.
- Settings remains an explicit manual theme selector.
- Classic CSS is scoped to `data-theme="classic"` and only targets terminal surfaces, preserving the light left/right workspace.
- Night Decisions/Git list rows now use dark panel styling through `.decision-item`; supporting timestamps use the night muted text color.

## Residual Risk

- Verification did not include automated screenshots; CSS behavior was reviewed through selectors and build output.
