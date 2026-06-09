# Node CPU 占用问题排查记录 - 2026-06-09

## 摘要

使用 SharkBay 过程中，Activity Monitor 里出现了一个或多个 `node` 进程接近 100% CPU。今天确认到的问题不是单一来源，而是两条独立链路：

1. CodeGraph 索引进程可能在 SharkBay 退出后继续存活。
2. Agent session / usage 采集逻辑可能过于频繁地扫描 Codex / Claude 历史日志目录。

这两个问题应分开修复，不建议用一个简单的时间窗口裁剪历史数据来同时处理。

## 问题一：CodeGraph 进程孤儿化

### 现象

高 CPU 的进程不是 Vite、Electron，也不是 SharkBay 主进程本身，而是 CodeGraph 自带的 bundled Node runtime：

```text
/Users/laibao/.local/share/fnm/node-versions/v20.20.2/installation/lib/node_modules/@colbymchenry/codegraph/node_modules/@colbymchenry/codegraph-darwin-arm64/node
```

该进程工作目录是：

```text
/Users/laibao/Code/memex_lab/memex
```

它持有了 CodeGraph 数据库文件：

```text
/Users/laibao/Code/memex_lab/memex/.codegraph/codegraph.db
/Users/laibao/Code/memex_lab/memex/.codegraph/codegraph.db-wal
/Users/laibao/Code/memex_lab/memex/.codegraph/codegraph.db-shm
```

确认到的命令是：

```text
codegraph init -i /Users/laibao/Code/memex_lab/memex
```

其中直接的 CodeGraph shim 进程曾经显示 `PPID=1`，说明 SharkBay 退出后，它已经脱离 SharkBay 进程树，变成了孤儿进程。

### SharkBay 内的触发链路

CodeGraph 进程由 SharkBay 通过以下链路启动：

```text
ProjectDetailPane
  -> ensureCodeGraphStatus(candidate.uri)
  -> IPC codegraph:ensureStatus
  -> SharkBayCoreService.ensureCodeGraphStatus
  -> CodeGraphManager.ensureProjectStatus
  -> codegraph init -i <project>
  -> codegraph sync -q <project>
```

相关文件：

- `src/renderer/App.tsx`
- `electron/ipc.ts`
- `src/core/core-service.ts`
- `src/core/codegraph-manager.ts`

### 可能根因

1. CodeGraph 初始化由项目详情页自动触发。
   - 本地 Git 项目会触发 `ensureCodeGraphStatus`。
   - 如果 CodeGraph 未初始化，SharkBay 会执行 `codegraph init`。
   - 如果检测到 pending changes，SharkBay 会执行 `codegraph sync`。

2. `codegraph` 命令本身是 npm shim。
   - shim 先由用户当前 Node 执行。
   - shim 再启动 CodeGraph 自带的平台 runtime。
   - Activity Monitor 最终显示的是 bundled runtime 的 `node` 进程。

3. SharkBay 当前没有稳定接管完整的 CodeGraph 进程树。
   - 如果只杀直接子进程，真实工作的 bundled Node 仍可能继续运行。
   - SharkBay 退出时如果 CodeGraph 正在建索引，进程可能继续跑。

4. App 退出清理链路需要审计。
   - `before-quit` 会调用 SharkBay cleanup。
   - cleanup 必须保证 core utility process 被杀之前，后台任务已经收到取消信号。

### 用户影响

- SharkBay 看起来已经退出，但 CPU 仍然持续很高。
- 如果 CodeGraph init 卡住，该进程可能运行数小时。
- Activity Monitor 只显示 `node`，不容易判断是 CodeGraph。
- `.codegraph` 数据库文件会保持打开状态。

### 修复建议

#### 产品行为

- 不要在项目选择或详情页加载时自动初始化 CodeGraph。
- 默认只读取 CodeGraph 状态，不主动执行 `init` 或 `sync`。
- `Init index` 和 `Sync index` 应改成用户显式点击。
- 索引过程中显示进度和取消按钮。
- 增加全局设置，用于关闭 CodeGraph 自动维护。

#### 进程管理

- 用可取消的进程组运行 CodeGraph 命令。
- 在 `CodeGraphManager` 内追踪 active jobs。
- SharkBay 退出时，先取消 active CodeGraph jobs，再杀 core utility process。
- timeout / cancel 时，应终止整个进程组，而不是只终止 npm shim。
- 建议先发 `SIGTERM`，短暂等待后仍未退出再发 `SIGKILL`。

#### 并发与状态

- 同一个项目同一时间只允许一个 CodeGraph job。
- `init` 正在运行时，不应再启动 `sync`。
- 长时间运行的 `init` 应作为后台任务管理，而不是一个 UI 被动等待的 IPC 调用。
- UI 应展示 `indexing`、`cancelled`、`failed`、`ready` 等状态。

#### 恢复方案

- 如果 CodeGraph 进程卡住，可以终止 `codegraph init` shim 以及它的 bundled Node 子进程。
- 如果 `.codegraph` 数据库损坏，使用 CodeGraph 自己的 `uninit` / `init` 流程，或删除 `.codegraph` 后重建。
- 建议将 `.codegraph` 排除在备份、系统索引或其他自动扫描之外。

## 问题二：Agent Session Watcher 与 Usage Backfill 的 CPU 风险

### 现象风险

SharkBay 启动时会启动 `AgentSessionWatcher`。它会轮询 agent transcript 目录，读取新行，用于展示 agent 状态和统计 token usage。

相关目录：

```text
~/.codex/sessions
~/.claude/projects
```

相关文件：

- `src/main/agent-clis.ts`
- `src/main/token-usage-collector.ts`
- `electron/ipc.ts`

### 当前行为需要审计

- Codex 状态发现逻辑读取最近的日期目录。
- Claude 状态发现逻辑可能反复枚举 project transcript 目录。
- Token usage backfill 可能在启动时扫描大量历史 transcript 文件。

如果用户的 Claude / Codex 历史很多，会造成持续 CPU 和 IO 压力。

### 重要约束

性能修复不能隐藏历史 session 或历史 usage 数据。

不建议简单限制为“最近 24 小时”或“最多 N 个文件”。这虽然能降低 CPU，但会改变用户可见的数据范围，导致历史 session 或 usage 看起来消失。

### 修复建议

#### 区分实时监控与历史数据

- 实时 watcher 只应关注活跃或最近修改的文件。
- 历史 session / usage 视图应查询本地索引库，而不是每次轮询重新扫描日志。
- backfill 应作为后台任务，有进度、暂停和恢复能力。

#### 增量索引

- 持久化每个日志文件的 offset、mtime、size。
- 文件 size / mtime 没变时直接跳过。
- 历史日志只回填一次，之后只处理增量。
- 将 transcript 文件元数据存入本地 SQLite。

#### 文件发现策略

- 避免每秒枚举所有 Claude project 目录。
- 文件发现结果可以缓存，并以较低频率刷新。
- 能可靠使用文件系统事件时优先使用 watcher。
- 大量历史目录扫描时应限制并发。

#### UI 行为

- usage / history 视图应有明确 range selector。
- 选择 `All` 时，应展示所有已索引历史。
- 如果 backfill 尚未完成，应明确展示“索引未完成”，而不是静默缺少旧数据。

## 问题三：`Sessions` 语义不清

目前代码里有多个概念都可能被用户理解成 “sessions”：

- 当前 SharkBay 进程内打开的 terminal / browser / editor tabs。
- 从 Codex / Claude transcript 里提取的实时 agent 状态。
- Teamwork task 里的 restore session。
- Usage report 历史数据。

这些目前不是一个统一的历史 session 列表。

### 产品建议

- 如果当前区域只表示打开的终端 tab，不应命名为历史 `Sessions`。
- 如果需要历史 agent session，应新增独立的 `Sessions` view。
- 明确定义 completed sessions 是否展示。
- 明确定义历史 session 的保留范围和筛选逻辑。
- restore session 能力不应依赖实时 watcher 是否还在跟踪该日志文件。

## 建议实施顺序

1. 先关闭或显式 gate CodeGraph 自动初始化。
2. 增加 CodeGraph job lifecycle 状态和 cancel 能力。
3. SharkBay 退出时，确保先取消 CodeGraph 后台任务，再终止 core process。
4. 增加 CodeGraph cancel 和 app cleanup 的测试。
5. 将 agent transcript 处理改成增量索引。
6. 通过索引库保留历史可见性，不用高频扫描所有历史日志。
7. 澄清 UI 里 `Sessions` 的含义和展示规则。

## 验证清单

- 启动 SharkBay，打开本地 Git 项目，在 CodeGraph indexing 中退出 SharkBay。
- 确认退出后不存在残留的 `codegraph init`、`codegraph sync` 或 CodeGraph bundled Node 进程。
- 确认只是选择项目不会自动开始 CodeGraph indexing。
- 确认 CodeGraph cancel 能同时停止 npm shim 和 bundled runtime。
- 确认大量 Claude / Codex 历史不会导致 SharkBay idle 状态持续高 CPU。
- 确认历史 usage / session 数据仍按用户选择范围展示。

