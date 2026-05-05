# Decisions

| Date | Decision | Context | Alternatives |
| --- | --- | --- | --- |
| 2026-05-05 | Use “Ripple” as the user-facing term for a SharkBay-managed harness project. | The user described root child directories as projects and harness-enabled directories as Ripple. | Keep exposing “harness” everywhere; invent another public term. |
| 2026-05-05 | Make this task UI-first and defer all-root child discovery. | Existing backend only returns harness/Ripple projects; adding non-harness discovery safely needs a separate scanner/API contract. | Expand this task into backend adoption work and risk changing safety boundaries. |
