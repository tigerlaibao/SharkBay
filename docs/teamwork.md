# SharkBay Teamwork

Teamwork lets local agents and humans share concise project work context through repo-local Markdown task files and a Git-backed team context branch.

## Current Implementation

Teamwork is installed per project from the `TEAM` detail tab. Installation:

1. Verifies the project is a Git worktree.
2. Resolves the current GitHub user through `gh api user`.
3. Requires a GitHub `origin` remote.
4. Checks that the user has `write` or `admin` permission.
5. Creates or fetches the `sharkbay-team-context` remote branch.
6. Writes the local harness files.
7. Starts immediate and periodic sync.

## Local Files

Installed Teamwork writes:

```text
repo/
  AGENTS.md
  .git/
    info/
      exclude
  .sharkbay/
    machine-id
    harness/
      protocol.md
    tasks/
      <taskId>-<slug>.md
    team-context/
      tasks/
        <year>/
          <month>/
            <taskId>-<slug>.md
```

`AGENTS.md` and `.sharkbay/` are local-only and ignored through `.git/info/exclude`. SharkBay only overwrites generated `AGENTS.md` files that contain its marker.

Older design drafts referenced generated `CLAUDE.md`, `GEMINI.md`, and per-agent instruction files. The current implementation uses a single generated `AGENTS.md` adapter plus `.sharkbay/harness/protocol.md`; generated legacy adapters are cleaned up when possible.

## Task Files

Agents maintain Markdown files under `.sharkbay/tasks/`. The harness protocol defines the required frontmatter and sections.

Required sections:

- `Summary`
- `Files`
- `Work`
- `Verification`
- `Notes`

Completed tasks include `status: completed`, `completedAt`, and a commit when the task produced one. SharkBay parses local tasks and mirrored team tasks into the `TEAM` tab.

## Sync Model

The shared context is a Git branch named `sharkbay-team-context`.

- Local completed tasks not already present in the remote context are copied to `.sharkbay-team-context/tasks/<year>/<month>/`.
- The sync loop fetches the branch, refreshes the local read-only mirror, finds pending completed local tasks, pushes them with retry on non-fast-forward errors, then refreshes the mirror again.
- The local mirror lives under `.sharkbay/team-context/` and should be treated as read-only.
- Active or pending local records take precedence over mirrored records with the same task id in the UI.

## UI Behavior

The `TEAM` tab shows:

- Teamwork status and errors.
- Install action when Teamwork is available but not installed.
- Task list with owner avatar, title, tag, owner, git-history-style created time, and status pill.
- Raw Markdown task detail for selected records.
- Automatic task list and selected task detail refresh while a project is open.

The project context menu can turn Teamwork off. If the authenticated GitHub user owns the repository, SharkBay can also delete the shared context branch during uninstall.

## Uninstall

Uninstall removes generated local Teamwork files and restores `.git/info/exclude` from the backup captured at install time when available. User-owned root instruction files are preserved.

Optional team-context cleanup deletes the remote `sharkbay-team-context` branch and the local remote ref, but only for the repository owner.

## Agent Responsibilities

Agents do not need special APIs to participate. They read `.sharkbay/harness/protocol.md`, create/update task files under `.sharkbay/tasks/`, record verification, and mark tasks completed when ready for sync.

Agents must not edit `.sharkbay/team-context/` directly.
