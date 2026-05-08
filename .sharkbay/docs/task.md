# Tasks

## Current Stage

User-centered project workbench redesign, read-only root child discovery, autonomous UX polish, confirmation-gated Ripple setup, project-authored developer metadata, human intervention signals, setup-time agent onboarding instructions, runner lifecycle separation, robust queue/task visibility, task detail drilldown, project terminal tabs, xterm/node-pty project terminal spaces, resizable workbench columns, minimum-width default columns, macOS Settings menu access, Settings-safe terminal persistence, simplified right detail column tabs with state-preserving tab panels, Behavioral Discipline harness updates, task-first runner registration diagnostics, runtime-derived terminal tab titles with interactive foreground app stability, project-aware workbench column headings, README publish refresh, public harness tracking cleanup, compact right detail tabs, harness template sync checking, visible harness sync UI, artifact-less backlog task metadata detail, direct side-column content layout, existing-project `.gitignore` preservation during Ripple setup, native macOS title bar removal, renderer window drag region restoration, contained `.sharkbay` harness setup with legacy compatibility, target-agent-owned `.gitignore` setup guidance, explicit legacy harness cleanup, clarified project task/runner/waiting state display, Settings terminal resize guarding, two-column Settings layout, custom app icon wiring, workbench layout polish, terminal/detail inset balance, native terminal scrollbar hiding, xterm custom scrollbar hiding, macOS packaging configuration, packaged app path fixes, project icons, day/night theme icons, theme/icon polish, Classic theme coverage, and Repository night polish are complete.

## Task List

| ID | Status | Title | Depends On | Notes |
| --- | --- | --- | --- | --- |
| `t-054-repository-night-and-classic-terminal` | done | Fix Repository night colors and Classic terminal styling | none | Night Repository fact tiles now use dark colors; Classic terminal chrome has additional old-style parity fixes |
| `t-053-classic-theme-and-night-panels` | done | Add classic theme and finish night panel coverage | none | Settings now includes Classic, which restores the pre-T051 light workspace with dark terminal; Night Decisions/Git rows and panels are dark-themed |
| `t-052-theme-icon-polish` | done | Polish day/night icons and theme colors | none | Day/night icons now have rounded macOS-style alpha, day terminal uses a warm cream palette, and night mode uses the original-inspired dark teal terminal palette with broader UI coverage |
| `t-051-day-night-theme-icons` | done | Add day and night app themes with matching icons | none | Settings now exposes day/night selection, app config persists the selected theme, UI and terminal colors follow it, and day/night icons are bundled |
| `t-050-project-icons` | done | Add project icons to the left project list | none | Left project rows show circular icons from local app icon data URLs, URL-derived favicon candidates, or the bundled shark-fin fallback |
| `t-049-packaged-app-blank-screen` | done | Fix packaged macOS app blank screen | none | Vite renderer assets are relative for `file://`, and packaged project detail reads use Electron runtime template resources |
| `t-048-macos-packaging-config` | done | Add macOS packaging config | none | electron-builder scripts/config generate local `.app`, DMG, and zip artifacts under ignored `release/` |
| `t-047-hide-xterm-custom-scrollbar` | done | Hide xterm custom scrollbar | none | Xterm custom translucent scrollbar and shadow UI are hidden in the terminal column |
| `t-046-hide-terminal-scrollbars` | done | Hide terminal scrollbars | none | Middle terminal xterm scrollbars are hidden while scrollback remains enabled |
| `t-045-workbench-column-inset-balance` | done | Balance workbench column top and bottom inset | none | Terminal/detail columns now have matching top and bottom outer spacing while left traffic-light avoidance remains intact |
| `t-044-workbench-layout-polish` | done | Polish workbench titlebar, terminal, and detail tabs | none | Hidden titlebar/drag space is constrained to the left column, terminal bottom padding prevents clipping, and right detail tabs are taller |
| `t-043-custom-app-icon` | done | Use shark image as SharkBay app icon | none | `resources/shark.png` is wired as the Electron window and macOS Dock icon; `resources/shark.icns` is ready for future packaging |
| `t-042-settings-two-column-redesign` | done | Redesign Settings as a two-column settings page | none | Settings now has left-side section navigation and right-side content for Project roots and Status |
| `t-041-settings-terminal-resize-guard` | done | Guard terminal resize when entering Settings | none | Hidden or unmeasured terminal surfaces no longer send invalid resize dimensions; backend ignores invalid resize payloads |
| `t-040-project-status-model` | done | Clarify project task, runner, and waiting states | none | Project rows now show normalized task queue status separately from runner execution and Needs Action waiting states |
| `t-039-legacy-harness-file-cleanup` | done | Clean up legacy root harness files after `.sharkbay` compatibility lands | `t-037-contained-sharkbay-harness-layout`, `t-038-gitignore-agent-owned-setup-guidance` | Explicit confirmed migration moves recognized legacy harness files into `.sharkbay/` and preserves `.gitignore` plus unrelated root content |
| `t-038-gitignore-agent-owned-setup-guidance` | done | Delegate setup gitignore changes to the target project agent | `t-037-contained-sharkbay-harness-layout` | T037 setup no longer writes target `.gitignore`; installed task guidance delegates ignore decisions to the target project agent |
| `t-001-sharkbay-mvp-spec` | done | Define SharkBay MVP product, architecture, and implementation plan | none | Electron + React + TypeScript MVP foundation implemented and verified |
| `t-002-self-hosting-ux` | done | Polish the self-hosting dashboard workflow | `t-001-sharkbay-mvp-spec` | Dashboard/detail/root/prompt workflow polished and verified |
| `t-003-dogfood-self-hosting-flow` | done | Dogfood the self-hosting workflow and fix first-use friction | `t-002-self-hosting-ux` | Preload bridge, layout breakpoint, and gate fallback fixed and verified |
| `t-004-user-centered-project-workbench` | done | Reframe SharkBay as a user-centered project workbench | `t-003-dogfood-self-hosting-flow` | UI-first redesign; roots/create moved to Settings and Projects became the main workbench |
| `t-005-root-child-discovery` | done | Discover ordinary root child projects and show Ripple setup status | `t-004-user-centered-project-workbench` | Read-only candidates now show managed vs not-setup project visibility |
| `t-006-autonomous-ux-polish` | done | Autonomous UX discipline polish | `t-005-root-child-discovery` | Self-directed UX cleanup of project rows, not-setup detail, and queue/detail signals |
| `t-007-ripple-setup-flow` | done | Design confirmation-gated Ripple setup for existing projects | `t-006-autonomous-ux-polish` | Not-setup projects can now install Ripple after confirmation |
| `t-008-project-authored-url-metadata` | done | Design project-authored developer metadata | `t-007-ripple-setup-flow` | Optional `.agent/development.json` metadata now powers a read-only Project Info summary |
| `t-009-human-intervention-policy` | done | Define human intervention signals | `t-008-project-authored-url-metadata` | Needs Action now shows only real human intervention, not dirty or automatic phases |
| `t-010-agent-onboarding-instructions` | done | Ensure setup projects instruct agents to follow Ripple harness | `t-009-human-intervention-policy` | Bundled setup now installs `AGENTS.md`; existing `AGENTS.md` collisions preserve local files |
| `t-011-runner-lifecycle-heartbeat` | done | Separate runner lifecycle from harness phase | `t-010-agent-onboarding-instructions` | `.agent/runner.json` lease/heartbeat state keeps physical runner lifecycle separate from task phase |
| `t-012-task-directory-queue-fallback` | done | Show task directories when queue metadata is incomplete | `t-011-runner-lifecycle-heartbeat` | Queue reader now honors section-specific backlog/done shapes and adds read-only task directory fallback rows |
| `t-013-task-detail-drilldown` | done | Task detail drilldown in project sidebar | `t-012-task-directory-queue-fallback` | Project overview now hides the large task artifact preview and opens task details from the task list |
| `t-014-terminal-integration` | done | Integrate project terminal tabs | `t-013-task-detail-drilldown` | Three-column workbench with terminal tabs rooted at the selected managed or not-setup project |
| `t-015-xterm-node-pty-terminal-spaces` | done | Replace terminal with xterm and node-pty project spaces | `t-014-terminal-integration` | Real PTY-backed terminal spaces are scoped per project, with multiple tabs per space |
| `t-016-resizable-workbench-columns` | done | Make workbench columns resizable | `t-015-xterm-node-pty-terminal-spaces` | Project, detail, and terminal columns can be resized with two persisted drag handles |
| `t-017-minimum-default-columns` | done | Initialize workbench columns at minimum widths | `t-016-resizable-workbench-columns` | First-load project and detail columns start at minimum width so terminal gets the remaining space |
| `t-018-macos-settings-menu` | done | Open Settings from the macOS app menu | `t-017-minimum-default-columns` | Settings is in the macOS app menu; the left project panel no longer shows search/filter/refresh/settings controls |
| `t-019-preserve-terminals-across-settings` | done | Preserve terminal spaces across Settings navigation | `t-018-macos-settings-menu` | Dashboard stays mounted while Settings is open so terminal tabs and output survive returning to the main view |
| `t-020-right-detail-card-tabs` | done | Convert right detail column into card tabs | `t-019-preserve-terminals-across-settings` | Right detail column exposes Tasks, Decisions, Git, and Info as card-style tabs; handoff stays inside Tasks; Decisions/Git render full lists directly; repository facts live in Git; Info shows project-authored metadata only |
| `t-021-harness-behavioral-discipline` | done | Add behavioral discipline to Ripple harnesses | `t-020-right-detail-card-tabs` | SharkBay, setup templates, AIBF, and AIGF now include ambiguity, simplicity, traceability, and verification-mapping rules |
| `t-022-runner-task-registration` | done | Make runner work visible only after task registration | `t-021-harness-behavioral-discipline` | Runner claims now require registered Active task state; SharkBay surfaces missing, inactive, or mismatched runner tasks as Needs Action |
| `t-023-terminal-title-strategy` | done | Improve terminal tab title strategy | `t-022-runner-task-registration` | Terminal tabs show project-relative cwd by default, long-running shell commands when useful, and stable `codex`/`claude`/monitor titles for interactive foreground apps |
| `t-024-project-aware-column-headings` | done | Project-aware workbench column headings | `t-023-terminal-title-strategy` | Terminal column title now shows the selected project name; right detail project name/path headers were removed |
| `t-025-readme-publish` | done | Refresh README and publish local commits | none | README now describes current workbench, runner, terminal, and native rebuild behavior |
| `t-026-public-harness-cleanup` | done | Clean public repository harness state and audit tracked content | none | Local harness/process history is no longer tracked publicly; push remains pending confirmation |
| `t-027-compact-right-detail-tabs` | done | Compact right detail tabs | none | Right detail tabs now use a compact tab strip and the left `NOT SETUP` divider was removed |
| `t-028-harness-template-sync` | done | Keep installed Ripple harness files current from tracked templates | none | Scan summaries now expose harness template drift and safe update functions update only version-owned control files, excluding project `.gitignore` |
| `t-029-harness-template-sync-ui` | done | Surface harness template drift and explicit sync in the UI | `t-028-harness-template-sync` | Managed project rows and detail panels now show stale/missing harness files with a per-project confirmed sync action |
| `t-031-backlog-task-metadata-detail` | done | Show queue metadata for backlog tasks without artifacts | none | Task drilldown now shows queue metadata and notes when artifact files do not exist yet |
| `t-033-remove-flat-side-panel-shells` | done | Remove flat side panel shells | none | Left and right workbench columns no longer inherit the generic panel shell; resizing, scrolling, terminal framing, and sticky tabs remain |
| `t-034-skip-existing-gitignore-setup` | done | Skip existing project gitignore during Ripple setup | none | Existing-directory setup preserves project-owned `.gitignore` while still failing real harness/document collisions |
| `t-035-native-titlebar-removal` | done | Hide native macOS title bar | none | Main Electron window now hides the visible standard macOS title bar while preserving native window controls |
| `t-036-window-drag-region` | done | Restore draggable window region | none | Transparent renderer drag strip restores hidden-titlebar window dragging while keeping left content below traffic-light controls |
| `t-037-contained-sharkbay-harness-layout` | done | Move new harness installs into a contained `.sharkbay` layout | none | New setup writes root `AGENTS.md` plus `.sharkbay/**`, preserves legacy compatibility, and does not write setup-owned `.gitignore` |

## Completed Work

| ID | Completed | Verification |
| --- | --- | --- |
| `t-050-project-icons` | 2026-05-08 | `npm run typecheck`, focused scanner tests, `npm run build`, `npm test`, `git diff --check`, and Vite HTTP smoke passed; automated screenshot unavailable because `agent-browser` was not installed and Computer Use app listing failed |
| `t-049-packaged-app-blank-screen` | 2026-05-07 | `npm run typecheck`, focused tests, `npm run build`, `npm test`, `npm run pack`, packaged AIGF detail smoke, packaged app launch, and `git diff --check` passed |
| `t-048-macos-packaging-config` | 2026-05-07 | `npm install --save-dev electron-builder`, `npm run typecheck`, `npm run build`, `npm run pack`, `npm run dist`, artifact/resource checks, `npm test`, and `git diff --check` passed |
| `t-047-hide-xterm-custom-scrollbar` | 2026-05-07 | `npm run typecheck`, `npm run build`, `git diff --check`, `npm test`, and Electron visual check passed |
| `t-046-hide-terminal-scrollbars` | 2026-05-07 | `npm run typecheck`, `npm run build`, `git diff --check`, `npm test`, and Electron visual check passed |
| `t-045-workbench-column-inset-balance` | 2026-05-07 | `npm run typecheck`, `npm run build`, `git diff --check`, `npm test`, and Electron visual check passed |
| `t-001-sharkbay-mvp-spec` | 2026-05-05 | `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, self-host scan probe, and dev smoke passed |
| `t-002-self-hosting-ux` | 2026-05-05 | `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, self-host scan probe, and dev smoke passed |
| `t-003-dogfood-self-hosting-flow` | 2026-05-05 | `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `git diff --check`, app dogfood scan, prompt generation, and dev smoke passed |
| `t-004-user-centered-project-workbench` | 2026-05-05 | `npm run typecheck`, `npm test`, `npm run build`, `git diff --check`, and subagent review passed |
| `t-005-root-child-discovery` | 2026-05-05 | `npm run typecheck`, scanner tests, renderer workflow tests, `npm test`, `npm run build`, `git diff --check`, and subagent review passed |
| `t-006-autonomous-ux-polish` | 2026-05-05 | `npm run typecheck`, `npm test`, `npm run build`, `git diff --check`, and self-review passed |
| `t-007-ripple-setup-flow` | 2026-05-05 | `npm run typecheck`, template installer tests, `npm test`, `npm run build`, and `git diff --check` passed |
| `t-008-project-authored-url-metadata` | 2026-05-05 | `npm run typecheck`, harness reader tests, `npm test`, `npm run build`, JSON parse check, and `git diff --check` passed |
| `t-009-human-intervention-policy` | 2026-05-05 | `npm run typecheck`, renderer workflow tests, `npm test`, `npm run build`, JSON parse check, UI check, and `git diff --check` passed |
| `t-010-agent-onboarding-instructions` | 2026-05-05 | `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `git diff --check`, JSON parse check, and dev-server smoke evidence passed; `npm run dev` was blocked by occupied port `5173` |
| `t-011-runner-lifecycle-heartbeat` | 2026-05-05 | `npm run typecheck`, `npm run lint`, focused runner tests, `npm test`, `npm run build`, `git diff --check`, and existing dev-server smoke evidence passed; `npm run dev` was blocked by occupied port `5173` |
| `t-012-task-directory-queue-fallback` | 2026-05-05 | `npm run typecheck`, focused harness reader tests, `npm test`, `npm run build`, and AIGF reader probe passed |
| `t-013-task-detail-drilldown` | 2026-05-05 | `npm run typecheck`, `npm test`, `npm run build`, `git diff --check`, and Vite HTTP smoke on port `5175` passed |
| `t-014-terminal-integration` | 2026-05-06 | `npm run typecheck`, `npm test` with 49 tests, `npm run build`, `git diff --check`, terminal focused tests, and browser layout smoke passed |
| `t-015-xterm-node-pty-terminal-spaces` | 2026-05-06 | `npm run rebuild:native`, `npm run typecheck`, `npm test` with 49 tests, `npm run build`, `git diff --check`, and browser layout smoke passed |
| `t-016-resizable-workbench-columns` | 2026-05-06 | `npm run typecheck`, `npm test` with 49 tests, `npm run build`, and `git diff --check` passed |
| `t-017-minimum-default-columns` | 2026-05-06 | `npm run typecheck`, `npm run build`, and `git diff --check` passed |
| `t-018-macos-settings-menu` | 2026-05-06 | `npm run typecheck`, `npm test` with 51 tests, `npm run build`, `git diff --check`, and menu template test passed |
| `t-019-preserve-terminals-across-settings` | 2026-05-06 | `npm run typecheck`, `npm test` with 51 tests, `npm run build`, and `git diff --check` passed |
| `t-020-right-detail-card-tabs` | 2026-05-06 | `npm run typecheck`, `npm test` with 51 tests, `npm run build`, `git diff --check`, Vite HTTP smoke, and desktop Electron tab/content checks passed; browser CLI was unavailable |
| `t-021-harness-behavioral-discipline` | 2026-05-06 | `git diff --check`, harness JSON parse checks, behavioral discipline text scan, and focused AIBF/AIGF diff checks passed |
| `t-022-runner-task-registration` | 2026-05-06 | `npm run typecheck`, focused runner registration tests, `npm test` with 52 tests, `npm run build`, and `git diff --check` passed |
| `t-023-terminal-title-strategy` | 2026-05-06 | `npm test -- tests/terminal.test.ts`, `npm run typecheck`, `npm test` with 54 tests, `npm run build`, and `git diff --check` passed; revision added OSC color response and interactive foreground app title regressions |
| `t-024-project-aware-column-headings` | 2026-05-06 | `npm run typecheck`, `npm run build`, and `git diff --check` passed |
| `t-025-readme-publish` | 2026-05-06 | `git diff --check`, harness JSON parse check, focused README review, and `git push origin main` passed |
| `t-026-public-harness-cleanup` | 2026-05-06 | Content audit, tracked-file inventory, `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check` passed |
| `t-027-compact-right-detail-tabs` | 2026-05-06 | `npm run typecheck`, `npm run build`, `git diff --check`, and running Electron visual check passed |
| `t-028-harness-template-sync` | 2026-05-06 | `npm run typecheck`, focused harness template sync tests, `npm test` with 59 tests, `npm run build`, and `git diff --check` passed |
| `t-029-harness-template-sync-ui` | 2026-05-06 | `npm run typecheck`, `npm test` with 59 tests, `npm run build`, and `git diff --check` passed |
| `t-031-backlog-task-metadata-detail` | 2026-05-06 | `npm test -- tests/harness-reader.test.ts`, `npm run typecheck`, `npm test` with 59 tests, `npm run build`, `git diff --check`, and AIGF reader probe passed |
| `t-033-remove-flat-side-panel-shells` | 2026-05-06 | `npm run typecheck`, `npm run build`, `git diff --check`, and existing Vite HTTP smoke passed |
| `t-034-skip-existing-gitignore-setup` | 2026-05-06 | `npm test -- tests/template-installer.test.ts`, `npm run typecheck`, `npm test` with 60 tests, `npm run build`, and `git diff --check` passed |
| `t-035-native-titlebar-removal` | 2026-05-06 | `npm run typecheck`, `npm run build`, and `git diff --check` passed |
| `t-036-window-drag-region` | 2026-05-07 | `git diff --check`, `npm run typecheck`, `npm run build`, and Electron visual check passed |
| `t-037-contained-sharkbay-harness-layout` | 2026-05-07 | Focused layout tests, `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check` passed |
| `t-039-legacy-harness-file-cleanup` | 2026-05-07 | Focused cleanup tests, `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check` passed |
| `t-040-project-status-model` | 2026-05-07 | Focused reader/workflow tests, `npm run typecheck`, `npm test`, `npm run build`, `git diff --check`, and four-project reader probe passed |
| `t-041-settings-terminal-resize-guard` | 2026-05-07 | Focused renderer/terminal tests, `npm run typecheck`, `git diff --check`, `npm test`, and `npm run build` passed |
| `t-042-settings-two-column-redesign` | 2026-05-07 | `npm run typecheck`, `npm run build`, `git diff --check`, focused renderer workflow tests, and `npm test` passed; visual check limited by occupied dev port |
| `t-043-custom-app-icon` | 2026-05-07 | Icon file checks, `npm run typecheck`, `npm run build`, and `git diff --check` passed |
| `t-044-workbench-layout-polish` | 2026-05-07 | `npm run typecheck`, `npm run build`, `npm test`, and `git diff --check` passed; default-port visual check limited by occupied port 5173 |

## Task Detail Template

```markdown
### T-001: Title

- Status: todo
- Depends on: none
- Task folder: `tasks/t-001/`
- Dependency lock: coding cannot start until dependencies are `done`

Implementation checklist:

- [ ] Identify files to change
- [ ] Implement behavior
- [ ] Run required checks
- [ ] Review
- [ ] Update docs
```

## Dependency Graph

```text
t-001-sharkbay-mvp-spec (done)
  -> t-002-self-hosting-ux (done)
    -> t-003-dogfood-self-hosting-flow (done)
      -> t-004-user-centered-project-workbench (done)
        -> t-005-root-child-discovery (done)
          -> t-006-autonomous-ux-polish (done)
            -> t-007-ripple-setup-flow (done)
              -> t-008-project-authored-url-metadata (done)
                -> t-009-human-intervention-policy (done)
                  -> t-010-agent-onboarding-instructions (done)
                    -> t-011-runner-lifecycle-heartbeat (done)
                      -> t-012-task-directory-queue-fallback (done)
                        -> t-013-task-detail-drilldown (done)
                          -> t-014-terminal-integration (done)
                            -> t-015-xterm-node-pty-terminal-spaces (done)
                              -> t-016-resizable-workbench-columns (done)
                                -> t-017-minimum-default-columns (done)
                                    -> t-018-macos-settings-menu (done)
                                      -> t-019-preserve-terminals-across-settings (done)
                                        -> t-020-right-detail-card-tabs (done)
                                          -> t-021-harness-behavioral-discipline (done)
                                            -> t-022-runner-task-registration (done)
                                              -> t-023-terminal-title-strategy (done)
                                                -> t-024-project-aware-column-headings (done)
t-025-readme-publish (done)
t-026-public-harness-cleanup (done)
t-027-compact-right-detail-tabs (done)
t-028-harness-template-sync (done)
t-029-harness-template-sync-ui (done)
```
