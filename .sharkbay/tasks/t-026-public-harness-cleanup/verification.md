# Verification

## Content Audit

| Check | Command | Exit | Result |
| --- | --- | --- | --- |
| Tracked local process inventory | `git ls-files .agent tasks docs/task.md docs/learnings.md | wc -l` | 0 | 194 tracked files were in scope before cleanup. |
| Product template inventory | `git ls-files templates/harness | wc -l` | 0 | 24 template files are tracked and must remain public. |
| Secret/token keyword scan | `rg -n -i "(secret|token|api[_-]?key|password|passwd|private key|BEGIN [A-Z ]*PRIVATE KEY|ssh-rsa|ghp_|github_pat_|sk-[A-Za-z0-9]|xox[baprs]-|DATABASE_URL|Authorization:|Bearer [A-Za-z0-9]|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}|client_secret|credential)" .agent tasks docs/task.md docs/learnings.md` | 0 | No likely secret values found. Matches were policy text, task references, and this task's audit language. |
| Local path / URL scan | `rg -n "(/Users/|/private/|/var/folders/|/tmp/|localhost|127\.0\.0\.1|git@github.com|https://github.com)" .agent tasks docs/task.md docs/learnings.md` | 0 | Found localhost/dev-server evidence, public GitHub remote URLs, and local sibling project paths such as `/Users/shark/Projects/AIBF` and `/Users/shark/Projects/AIGF`. These support removing process files from public tracking. |
| PII-style keyword scan | `rg -n -i "(email|e-mail|@[A-Za-z0-9._%+-]+\.[A-Za-z]{2,}|phone|address|身份证|手机号|password\s*=|token\s*=|key\s*=)" .agent tasks docs/task.md docs/learnings.md` | 0 | No PII/credential assignment values found; matches were false positives such as words containing "address" or public Git remote text. |

## Cleanup Verification

| Check | Command | Exit | Result |
| --- | --- | --- | --- |
| Whitespace | `git diff --check` | 0 | No output. |
| Local harness no longer tracked | `git ls-files .agent tasks docs/task.md docs/learnings.md | wc -l` | 0 | 0 tracked files remain for root local harness/process paths. |
| Templates still tracked | `git ls-files templates/harness | wc -l` | 0 | 24 tracked files remain. |
| Ignore rules | `git check-ignore -v .agent/state.json tasks/t-026-public-harness-cleanup/status.md docs/task.md docs/learnings.md` | 0 | Root ignore rules matched all expected local harness/process paths. |
| Local files preserved | `test -f .agent/state.json && test -f tasks/t-026-public-harness-cleanup/status.md && echo local-harness-files-still-present` | 0 | Local files still exist on disk. |

## Build Verification

| Check | Command | Exit | Result |
| --- | --- | --- | --- |
| Typecheck | `npm run typecheck` | 0 | Renderer and node TypeScript checks passed. |
| Tests | `npm test` | 0 | 10 test files passed, 54 tests passed. |
| Build | `npm run build` | 0 | TypeScript node build and Vite production build passed. Vite reported the existing large chunk warning. |

## Residual Risk

This task does not rewrite Git history. Previously pushed commits may still contain the removed harness/process files. The audit did not find likely secret values, but it did find local project names and paths in historical process files, which is why the forward cleanup is appropriate.
