# Verification

## Done Criteria Evidence

| Criterion | Evidence |
| --- | --- |
| `README.md` describes the current SharkBay workbench capabilities | Source review confirms README now covers runner lifecycle, detail tabs, project terminal workspaces, resizable columns, and Settings-safe terminal persistence. |
| README development section mentions native terminal rebuild needs | Source review confirms the `npm run rebuild:native` note is present. |
| Harness task/state files record this ad hoc docs/publish task | Source review confirms queue/state/status artifacts include `t-025-readme-publish`. |
| Updated branch is committed and pushed to `origin/main` | Commit is pending at verification write time; push must run after the commit exists. |

## Command Evidence

```text
git diff --check
exit 0
```

```text
jq empty .agent/manifest.json .agent/state.json .agent/queue.json .agent/runner.json
exit 0
```

## Residual Risk

- Push verification is external to the committed docs because `git push` must run after the completion commit exists.
