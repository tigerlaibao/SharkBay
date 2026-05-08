# T-072 Implementation

## Summary

- Added Python virtualenv CLI web service discovery in `src/main/dev-services.ts`.
- Discovery now reads root `pyproject.toml` `[project.scripts]`, requires an installed `.venv/bin/<script>` console script, requires the entrypoint module to import/register a `web` command, and reads the `web.py` Click defaults for host, port, and `--no-token` support.
- The generated command for `../wechat-cli` is:

```sh
source .venv/bin/activate && wechat-cli web --host 127.0.0.1 --port 8765 --no-token
```

## Files Changed

- `src/main/dev-services.ts`: added a narrow Python CLI web service discovery path alongside existing package.json dev script discovery.
- `tests/dev-services.test.ts`: added focused coverage for the `wechat-cli`-style virtualenv web service and a negative missing-venv-script case.

## Notes

- Existing npm/pnpm/yarn/bun `dev` and `dev:*` discovery remains unchanged.
- No files in `../wechat-cli` were modified; it was inspected read-only.
