# Contract

## Scope

Add a scoped file browser to the existing right detail column for the selected project.

## Functional Requirements

- Add a `FILES` tab to the right detail tabs.
- Load a project-relative file tree for the selected managed or not-setup project.
- Exclude heavy or generated directories such as `.git`, `node_modules`, build outputs, and SharkBay release output from the tree.
- Treat common text/code/document extensions as editable, including `.md`, `.ts`, `.tsx`, `.js`, `.jsx`, `.json`, `.css`, `.html`, `.txt`, `.yml`, `.yaml`, `.toml`, `.sh`, and similar project text files.
- On double-click of an editable file, open a new terminal tab rooted at the selected project and execute `nano <project-relative-file>`.
- Preserve existing terminal/service behavior.

## Safety Requirements

- Backend listing must resolve the project through configured roots, not trust renderer-supplied filesystem paths as authority.
- File paths returned to the renderer must be project-relative.
- File list traversal must not follow symlinked directories.
- `nano` command must quote the selected relative path safely.

## Non-Goals

- No in-app editor.
- No file mutation from the Files tab itself.
- No recursive listing outside the selected project.
- No binary preview.

## Verification

- Run focused tests for project file tree listing and editable classification.
- Run `npm run typecheck`.
- Run `npm run build`.
- Run `git diff --check`.
