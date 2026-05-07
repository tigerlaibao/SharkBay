# Design

## Decision

Use a dedicated `.agent/development.json` file for project-authored developer metadata.

`manifest.json` should index this file through `files.development`, but should not absorb the full metadata body. `state.json` remains the home for current workflow/runtime state. This keeps stable project facts separate from volatile task execution evidence and avoids turning the manifest into a large settings document.

## Rationale

The three design explorations agreed on the product direction: SharkBay should stay read-only for project details wherever possible, and project agents should maintain facts as part of harness work.

They differed on data shape:

- A UX view recommended a very narrow first surface: links only on overview, everything else hidden.
- A data-model view recommended `.agent/development.json` to avoid bloating manifest/state.
- A protocol view recommended separating stable declarations from dynamic runtime state.

The synthesis is:

- Data model can be broad enough for useful project facts.
- Overview UI must stay narrow and only show present, actionable facts.
- Protocol must stop agents from writing transient observations into stable metadata.

## File Layout

```text
.agent/manifest.json
.agent/development.json
.agent/state.json
```

`manifest.json`:

```json
{
  "files": {
    "development": ".agent/development.json"
  }
}
```

`.agent/development.json`:

```json
{
  "schemaVersion": 1,
  "updatedAt": "2026-05-05T19:02:00+08:00",
  "maintainedBy": "project-agent",
  "stack": {
    "appShell": ["Electron"],
    "frontend": ["React", "TypeScript", "Vite"],
    "runtime": ["Node.js"],
    "storage": ["local JSON/files"]
  },
  "environment": {
    "packageManager": "npm",
    "setupCommands": ["npm install"],
    "requiredEnvFiles": []
  },
  "commands": {
    "dev": ["npm run dev"],
    "test": ["npm test"],
    "typecheck": ["npm run typecheck"],
    "build": ["npm run build"],
    "deploy": []
  },
  "endpoints": {
    "local": [{ "label": "Dev app", "url": null, "ports": [5173], "source": "agent" }],
    "test": [],
    "production": []
  },
  "ports": [
    { "port": 5173, "protocol": "http", "purpose": "Vite dev server", "status": "expected" }
  ],
  "tools": ["electron", "vite", "vitest"],
  "notes": []
}
```

## UI

Add a `Project Info` summary card to project detail.

Visible when present:

- Stack summary: compact technology list.
- Links: only endpoints with URLs.
- Commands: dev/test/typecheck/build/deploy command chips.
- Ports: expected ports with purpose.
- Tools: compact list, capped.
- Updated timestamp only when useful.

Absent fields disappear. Unknown/sentinel values are not shown.

Do not add manual editing UI in this task. The existing project settings URL editor can remain for compatibility, but this task moves the product direction toward project-authored read-only metadata.

## Agent Update Protocol

Project agents should review developer metadata:

- after Ripple setup or project initialization
- before coding if contract/design discovers project facts
- after coding if scripts, ports, services, deployments, or tools changed
- after deployment if a stable URL or deployment surface changed
- before done/docs update as a metadata consistency checkpoint

Agents must not write secrets, tokens, transient PIDs, one-off preview URLs, or temporary local process status into `.agent/development.json`.

## Compatibility

- Missing `.agent/development.json` is normal.
- Invalid `.agent/development.json` is a diagnostics issue, not a project load failure.
- Existing URL fields remain readable from `state.project` and `manifest.runtime`.
- Template setup should create an empty but valid development metadata file.
