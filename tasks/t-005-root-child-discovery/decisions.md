# Decisions

| Date | Decision | Reason | Alternatives Considered |
| --- | --- | --- | --- |
| 2026-05-05 | Start with read-only child discovery before one-click setup writes. | Existing create flow refuses non-empty directories and injection needs a safer confirmation design. | Immediately write Ripple files into existing projects. |
