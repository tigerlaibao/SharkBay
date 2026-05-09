# Task Status

- Task ID: `t-079-workbench-file-git-polish`
- Title: Polish Files, task detail, and Git dirty file workflows
- Phase: done
- Status: done
- Priority: 1
- Depends on: none
- Started: 2026-05-09T15:25:45+08:00

## Request

FILES tab上不要有图标. 打开文件默认的nano改成vim(先看看系统里有没有vim,没有的话fallback到nano). 点击一条task查看详情的时候,task title默认在后退按钮的下一行.GIT tab下的Pepository面板内容展示改紧凑一点.在Pepository面板下方,插入一个dirty文件的列表（精凑一点）,双击文件名打开一个新的terminal tab,用diff展示它的变化.

## Progress

- Registered active task.
- Confirmed local `vim` exists at `/opt/homebrew/bin/vim`; implementation will still include runtime fallback to `nano`.
- Removed Files tab glyphs and Files tab icon.
- Changed editable file launch to `vim` with `nano` fallback.
- Moved task detail title under the back button.
- Compacted Repository facts and added dirty file diff launcher.
- Verification passed.

## Verification Plan

- `npm test -- tests/git.test.ts tests/project-files.test.ts`
- `npm run typecheck`
- `npm run build`
- `git diff --check`
