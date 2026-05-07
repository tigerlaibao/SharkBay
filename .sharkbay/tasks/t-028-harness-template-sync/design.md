# Design

## Behavior

Add a `harness-template-sync` service in the main process:

- `readTemplateSyncPlan(templateDir)` reads the allowlisted version-owned template files and returns their content hashes plus a combined template version hash.
- `checkHarnessTemplateSync(input)` resolves the target repo through configured roots, rejects unsafe symlinks, reads installed files, and reports status:
  - `current`: all version-owned files match the current template.
  - `stale`: at least one version-owned file exists but differs.
  - `missing`: at least one version-owned file is missing.
  - `unknown`: template metadata is missing or unreadable but files still match current content.
- `updateHarnessTemplateFiles(input)` writes only version-owned files from the current template and writes `.agent/template-sync.json` metadata with the current version and file hashes.

New installs should call the same update primitive after the initial template copy so newly created projects include sync metadata from day one.

## Data

New metadata file:

```json
{
  "schemaVersion": 1,
  "source": "sharkbay/templates/harness",
  "version": "sha256...",
  "updatedAt": "2026-05-06T21:40:17.000Z",
  "versionOwnedFiles": [
    { "path": "AGENTS.md", "sha256": "..." }
  ]
}
```

The metadata is advisory. File content remains the authority for update decisions because older projects will not have the metadata.

## API Surface

The first slice exports functions from `src/main/harness-template-sync.ts` and adds shared types. IPC/UI can be added after the service behavior is stable.

## Safety

- Use configured-root resolution before reading or writing project files.
- Reject absolute paths and `..` relative paths in version-owned file paths.
- Reject symlinked installed files before write.
- Do not traverse the whole template tree for updates; use the allowlist.
- Use atomic writes for metadata and plain file writes for text files after safety checks and directory creation.

## Files Likely To Change

- `src/main/harness-template-sync.ts`
- `src/main/template-installer.ts`
- `src/shared/types.ts`
- `tests/harness-template-sync.test.ts`
- `tests/template-installer.test.ts`
- `docs/architecture.md`
- `docs/task.md`

## Risks

- Treating all seeded files as template-owned would corrupt project history; the allowlist avoids that.
- Existing projects may have local edits to `AGENTS.md` or protocol files; the check reports differences before update, and update remains an explicit operation.
