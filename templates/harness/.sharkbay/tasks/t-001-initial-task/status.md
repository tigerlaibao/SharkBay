# Task Status

## Metadata

| Field | Value |
| --- | --- |
| Task ID | `t-001-initial-task` |
| Title | Initial task |
| Priority | 1 |
| Phase | spec |
| Owner Role | Planner |
| Depends On | none |
| Created | {{DATE}} |
| Updated | {{DATE}} |

## Goal

Define the first task for {{PROJECT_NAME}}.

## Initial Harness Checkpoint

If this project is a git repository, the agent completing this initial task must commit the installed harness files before marking the task done. Use a focused message such as `Initialize Ripple harness state`. If a commit cannot be made, record the reason here before stopping.

## Gitignore Review

SharkBay setup did not write or merge this project's `.gitignore`. During the initial task, the project agent should decide whether repository conventions require ignoring local runtime files such as `.sharkbay/runner.json`, then make any `.gitignore` change explicitly as a project-owned edit.

## Current Gate

| Gate | Status | Notes |
| --- | --- | --- |
| Dependencies | pass | No dependencies. |
