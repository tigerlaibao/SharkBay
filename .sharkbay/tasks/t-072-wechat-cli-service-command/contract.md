# T-072 Contract: Cover wechat-cli web service startup

## Scope

Add the smallest SharkBay change needed for dev service controls to discover and start a Python virtualenv CLI web service in `../wechat-cli`.

The known target command is:

```sh
source .venv/bin/activate
wechat-cli web --host 127.0.0.1 --port 8765 --no-token
```

## Assumptions

- `../wechat-cli` is a local sibling project under a configured root, so SharkBay may read it as part of project scanning.
- Starting through an executable inside `.venv/bin` is equivalent to shell activation for the service process and avoids relying on interactive shell state.
- Stop behavior can reuse the existing service-bound terminal stop/close path once the service starts in a managed terminal tab.

## Non-Goals

- No general service editor UI.
- No arbitrary command registry or remote execution.
- No automatic dependency installation or virtualenv creation.
- No changes outside SharkBay and read-only inspection of `../wechat-cli`.

## Done Criteria

- Inspect `../wechat-cli` enough to identify authoritative startup metadata or, if absent, the best local heuristic.
- SharkBay discovers a service for `../wechat-cli` that runs the equivalent of `wechat-cli web --host 127.0.0.1 --port 8765 --no-token`.
- Existing package-based service discovery still works.
- Verification records focused tests or probes, typecheck/build as appropriate, and `git diff --check`.

## Risks

- Python projects may expose console scripts through `.venv/bin` without a root package script; discovery must stay narrow enough to avoid turning any virtualenv command into a UI service.
- Some virtualenvs may not exist until setup completes; missing `.venv/bin/wechat-cli` should not break project scanning.
