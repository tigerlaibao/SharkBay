# Design

Use the initial harness task as the instruction surface. This keeps setup non-invasive while still telling the target project agent exactly what decision to make.

The setup template's initial task includes a Gitignore Review section:

- SharkBay did not write or merge `.gitignore`.
- The target project agent should decide whether repository conventions require ignoring runtime-only files such as `.sharkbay/runner.json`.
- Any `.gitignore` edit is a project-owned change.

No product code changes are needed beyond the `t-037` implementation already committed.
