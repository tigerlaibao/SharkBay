# Decisions

| Date | Decision | Rationale | Alternative |
| --- | --- | --- | --- |
| 2026-05-05 | Expand `t-008` from URL metadata to project-authored developer metadata. | The user wants to move away from per-project settings and toward useful read-only project facts maintained by project agents. | Keep the task limited to local/test/deploy URL fields. |
| 2026-05-05 | Store developer metadata in `.agent/development.json`, indexed from manifest. | Keeps manifest/state small while giving project agents a stable place for development facts. | Put all metadata into `manifest.json` or keep using `state.project` URL fields. |
