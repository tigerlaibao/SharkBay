# Product Notes

SharkBay is a local-first project workbench for macOS. It is built for developers who keep multiple local repositories active and want one place to see repository state, open terminals, launch development services, inspect files, use local agent CLIs, and coordinate task context.

## Current Product Surface

- **Projects**: manually add project directories or configure parent scan roots.
- **Project list**: show repository icon, name, path or agent status, dirty state, running services, and terminal activity.
- **Terminal workspace**: keep per-project terminal tabs alive while switching projects and Settings.
- **Development services**: expose detected `dev` and `dev:*` commands as service pills.
- **Browser tabs**: open web URLs in embedded project browser tabs.
- **TEAM tab**: show Teamwork status, install Teamwork, list task records, and inspect raw Markdown task details.
- **Git tab**: show repository facts, dirty files, and recent reflog history.
- **Files tab**: lazily browse project files and open editable files in a terminal editor.
- **Settings**: manage configured projects, scan roots, scan status, and appearance theme.

## Project Discovery

SharkBay supports two project sources:

- Configured projects: exact directories selected by the user.
- Configured scan roots: parent directories walked for Git repositories.

Scan roots are searched up to a default depth of six. Common cache/build directories and hidden directories are skipped. Manually configured projects are merged with scanned repositories and sorted by project name.

## Teamwork

Teamwork is opt-in per project. Installing it adds a repo-local `.sharkbay` harness and generated local `AGENTS.md`, then enables task-file sync through the remote `sharkbay-team-context` branch when GitHub permissions allow it.

Teamwork does not replace Git commits or code review. It gives humans and agents a compact local record of current work, verification, files touched, and future context.

## Product Boundaries

- SharkBay is a desktop app, not a web service.
- It is desktop-first and currently has an `1180px` minimum window width.
- It only operates on user-configured projects or roots.
- It does not run agents invisibly; agent CLIs launch in visible terminal tabs.
- It does not sync repository data unless a feature explicitly requires it, such as Teamwork.
- It does not provide a full IDE editor. File actions open terminal-based editor/diff commands.
