# Decisions

| Date | Decision | Context | Alternatives |
| --- | --- | --- | --- |
| 2026-05-05 | Start SharkBay with a spec task before coding. | `init.md` requires spec, design, and contract before implementation. | Start coding immediately; rejected by harness protocol. |
| 2026-05-05 | Shape SharkBay as a macOS local app. | User wants a local macOS app and is new to macOS app development. | Browser-only web app; native SwiftUI app; Tauri app. |
| 2026-05-05 | Recommend Electron + React + TypeScript + Vite for the first implementation path. | It keeps the UI web-like while giving the app straightforward local filesystem access through Node. | SwiftUI is more native but a larger learning jump; Tauri is lighter but adds Rust complexity. |
| 2026-05-05 | Keep Codex edits inside `<repo-root>`; SharkBay will later manage user-configured roots. | User explicitly set the current project space as Codex's edit boundary. | Broad filesystem access; rejected. |
| 2026-05-05 | Treat SharkBay as its own first managed harness project. | User clarified that we are building SharkBay itself, and using SharkBay's harness to manage that work. | Treat SharkBay as only an external manager of other repos; rejected. |
| 2026-05-05 | Configure git remote origin as `git@github.com:SharkUI/sharkbay.git`. | User provided the repository URL and asked to continue. | Leave URL recorded but unconfigured. |
| 2026-05-05 | Advance task `t-001-sharkbay-mvp-spec` from `spec` to `design`. | Spec now has clear scope, non-goals, and acceptance criteria. | Keep asking intake questions; rejected because defaults were sufficient. |
| 2026-05-05 | Advance task `t-001-sharkbay-mvp-spec` from `design` to `design_review`. | Design now covers behavior, data, UI/API impact, likely files/modules, risks, and verification plan. | Start coding; rejected because contract is not written yet. |
| 2026-05-05 | Move task `t-001-sharkbay-mvp-spec` from `design_review` to `design_revision`. | Design review found one major issue: safe JSON state writes were not designed. | Ignore the finding; rejected by quality rules. |
| 2026-05-05 | Return task `t-001-sharkbay-mvp-spec` to `design_review`. | Design revision now defines safe harness JSON writes, URL persistence, and safety verification coverage. | Proceed directly to contract without review; rejected by quality rules. |
| 2026-05-05 | Advance task `t-001-sharkbay-mvp-spec` from `design_review` to `contract`. | Second design review passed with blocker=0, major=0, and minor=0. | Continue revising design; unnecessary after pass. |
| 2026-05-05 | Advance task `t-001-sharkbay-mvp-spec` from `contract` to `coding`. | Contract names done criteria, allowed files, required checks, cross-validation, and stop conditions. | Keep planning; unnecessary because coding gate is satisfied. |
| 2026-05-05 | Advance task `t-001-sharkbay-mvp-spec` from `coding` to `code_review`. | Implementation notes and required command evidence are recorded. | Continue coding without review; rejected by protocol. |
| 2026-05-05 | Move task `t-001-sharkbay-mvp-spec` from `code_review` to `code_revision`. | Code review found one blocker and two major findings. | Ignore findings; rejected by quality rules. |
| 2026-05-05 | Return task `t-001-sharkbay-mvp-spec` from `code_revision` to `code_review`. | Safety findings were revised and regression checks pass. | Proceed directly to verification; rejected because code review must pass first. |
| 2026-05-05 | Advance task `t-001-sharkbay-mvp-spec` from `code_review` to `verification`. | Second code review passed with blocker=0, major=0, and minor=0. | Continue review; unnecessary after pass. |
| 2026-05-05 | Advance task `t-001-sharkbay-mvp-spec` from `verification` to `docs_update`. | Verification passed with command, self-host scan, and dev smoke evidence. | Repeat verification; unnecessary unless new code changes are made. |
| 2026-05-05 | Mark task `t-001-sharkbay-mvp-spec` done. | Docs were updated after successful verification and all gates passed. | Keep task active; unnecessary after completion. |
