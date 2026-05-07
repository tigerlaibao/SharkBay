import { promises as fs } from "node:fs";
import path from "node:path";
import type {
  ActiveTaskSummary,
  DevelopmentMetadata,
  DetectionMode,
  GateStatus,
  HarnessError,
  IpcRuntimeLike,
  ProjectDetailInput,
  ProjectDetail,
  ProjectSummary,
  QueueSection,
  RecentDecision,
  RevisionMap,
  RunnerSummary,
  TaskArtifacts,
  TaskQueueItem,
  UrlFields,
} from "../shared/types.js";
import { asQueueItem, emptyRunnerSummary, isRecord, normalizeDevelopmentMetadata, normalizeRunnerMetadata, normalizeUrlFields, validateDevelopmentJson, validateRunnerJson } from "../shared/schema.js";
import { getRuntimeConfigPath, loadAppConfig } from "./config.js";
import { readGitHistory, readGitMetadata } from "./git.js";
import { detectHarnessLayout, harnessJsonRelativePath, type HarnessLayout } from "./harness-layout.js";
import { checkHarnessTemplateSync } from "./harness-template-sync.js";
import { checkLegacyHarnessCleanup } from "./legacy-harness-cleanup.js";
import { readJsonFile } from "./json-file.js";
import { isPathInside, resolveReadableHarnessJsonFile, resolveReadableRepoFile, resolveRepoPath } from "./path-safety.js";

const artifactFiles: Record<keyof TaskArtifacts, string> = {
  statusMarkdown: "status.md",
  specMarkdown: "spec.md",
  designMarkdown: "design.md",
  designReviewMarkdown: "design-review.md",
  contractMarkdown: "contract.md",
  codeReviewMarkdown: "code-review.md",
  verificationMarkdown: "verification.md",
  decisionsMarkdown: "decisions.md",
  implementationMarkdown: "implementation.md",
};

export async function readProjectSummary(repoPath: string, detection: DetectionMode, configuredRoots?: string[], templateDir?: string): Promise<ProjectSummary> {
  const detail = await readProjectDetail(repoPath, detection, { includeArtifacts: false, configuredRoots, templateDir });
  const {
    queue: _queue,
    currentTask: _currentTask,
    taskArtifacts: _taskArtifacts,
    recentDecisions: _decisions,
    gitHistory: _gitHistory,
    development: _development,
    revisions: _revisions,
    ...summary
  } = detail;
  return summary;
}

export function readProjectDetail(repoPath: string, detection: DetectionMode, options?: { includeArtifacts?: boolean; configuredRoots?: string[]; templateDir?: string }): Promise<ProjectDetail>;
export function readProjectDetail(runtime: IpcRuntimeLike, input: ProjectDetailInput): Promise<ProjectDetail>;
export async function readProjectDetail(
  first: string | IpcRuntimeLike,
  second: DetectionMode | ProjectDetailInput,
  options: { includeArtifacts?: boolean; configuredRoots?: string[]; templateDir?: string } = {},
): Promise<ProjectDetail> {
  const rawRepoPath = typeof first === "string" ? first : repoPathFromInput(second);
  const detection = typeof second === "string" ? second : second.detection ?? "manifest";
  const configuredRoots = typeof first === "string"
    ? options.configuredRoots ?? [rawRepoPath]
    : (await loadAppConfig(getRuntimeConfigPath(first))).configuredRoots;
  const errors: HarnessError[] = [];
  let repoPath: string;
  let containingRoot: string;
  try {
    const safeRepo = await resolveRepoPath(rawRepoPath, configuredRoots);
    repoPath = safeRepo.repoPath;
    containingRoot = safeRepo.containingRoot;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return unsafeProjectDetail(rawRepoPath, detection, message);
  }

  const detectedLayout = await detectHarnessLayout(repoPath);
  if (!detectedLayout) {
    return unsafeProjectDetail(repoPath, detection, "Repository does not contain a supported harness layout");
  }
  const layout = detectedLayout.layout;

  const manifest = await readHarnessJson(repoPath, configuredRoots, layout, ".agent/manifest.json", errors);
  const state = await readHarnessJson(repoPath, configuredRoots, layout, ".agent/state.json", errors);
  const queueJson = await readHarnessJson(repoPath, configuredRoots, layout, ".agent/queue.json", errors);
  const git = await readGitMetadata(repoPath);
  const gitHistory = await readGitHistory(repoPath);
  const development = await readDevelopmentMetadata(repoPath, configuredRoots, layout, errors);
  const runnerMetadata = await readRunnerMetadata(repoPath, configuredRoots, layout, errors);

  const queue = normalizeQueue(queueJson.data);
  const visibleQueue = await mergeTaskDirectoryQueue(repoPath, containingRoot, configuredRoots, layout, queue, errors);
  const activeTask = normalizeActiveTask(visibleQueue, state.data);
  const runner = annotateRunnerTaskRegistration(runnerMetadata, visibleQueue, readStateCurrentTaskId(state.data), repoPath, layout, errors);
  const urls = readUrls(state.ok, state.data, manifest.data);
  const name = readProjectName(manifest.data, repoPath);
  const repoUrl = readRepoUrl(state.data) || readRepoUrl(manifest.data) || git.githubUrl;
  const harnessTemplate = await readHarnessTemplateSummary(repoPath, configuredRoots, options.templateDir, errors);
  const legacyHarnessCleanup = await readLegacyHarnessCleanupSummary(repoPath, configuredRoots, errors);
  const currentTask = options.includeArtifacts === false || !activeTask ? null : await readTaskArtifacts(repoPath, configuredRoots, layout, activeTask.taskId, errors);
  const taskArtifacts = options.includeArtifacts === false ? {} : await readVisibleTaskArtifacts(repoPath, configuredRoots, layout, visibleQueue, errors);
  const recentDecisions = readRecentDecisions(state.data);

  return {
    id: repoPath,
    name,
    path: repoPath,
    detection,
    repoUrl,
    currentBranch: git.currentBranch,
    dirtyWorktree: git.dirtyWorktree,
    activeTask,
    runner,
    localUrl: urls.localUrl,
    testUrl: urls.testUrl,
    deploymentUrl: urls.deploymentUrl,
    errors,
    harnessTemplate,
    legacyHarnessCleanup,
    queue: visibleQueue,
    currentTask,
    taskArtifacts,
    recentDecisions,
    gitHistory,
    development,
    revisions: {
      manifest: manifest.revision,
      state: state.revision,
      queue: queueJson.revision,
    },
  };
}

async function readLegacyHarnessCleanupSummary(
  repoPath: string,
  configuredRoots: string[],
  errors: HarnessError[],
): Promise<ProjectSummary["legacyHarnessCleanup"]> {
  const result = await checkLegacyHarnessCleanup({ repoPath, configuredRoots });
  if (!result.ok) {
    errors.push({ file: repoPath, message: `Legacy harness cleanup check failed: ${result.message}` });
    return null;
  }

  return {
    status: result.status,
    message: result.message,
    moves: result.moves,
    blockers: result.blockers,
  };
}

async function readHarnessTemplateSummary(
  repoPath: string,
  configuredRoots: string[],
  templateDir: string | undefined,
  errors: HarnessError[],
): Promise<ProjectSummary["harnessTemplate"]> {
  const result = await checkHarnessTemplateSync({ repoPath, configuredRoots, templateDir });
  if (!result.ok) {
    errors.push({ file: repoPath, message: `Harness template sync check failed: ${result.message}` });
    return null;
  }

  return {
    status: result.status,
    currentVersion: result.currentVersion,
    installedVersion: result.installedVersion,
    staleFiles: result.files.filter((file) => file.status === "stale").map((file) => file.path),
    missingFiles: result.files.filter((file) => file.status === "missing").map((file) => file.path),
  };
}

async function readVisibleTaskArtifacts(
  repoPath: string,
  configuredRoots: string[],
  layout: HarnessLayout,
  queue: Record<QueueSection, TaskQueueItem[]>,
  errors: HarnessError[],
): Promise<Record<string, TaskArtifacts>> {
  const taskIds = [...new Set(Object.values(queue).flat().map((item) => item.taskId).filter((taskId) => Boolean(taskId.trim())))];
  const entries = await Promise.all(taskIds.map(async (taskId) => [taskId, await readTaskArtifacts(repoPath, configuredRoots, layout, taskId, errors)] as const));
  return Object.fromEntries(entries);
}

async function readRunnerMetadata(repoPath: string, configuredRoots: string[], layout: HarnessLayout, errors: HarnessError[]): Promise<RunnerSummary> {
  const relativePath = layout.runnerJson;
  let filePath: string;
  try {
    filePath = await resolveReadableRepoFile(repoPath, configuredRoots, relativePath);
  } catch (error) {
    errors.push({ file: path.join(repoPath, relativePath), message: error instanceof Error ? error.message : String(error) });
    return emptyRunnerSummary();
  }

  const result = await readJsonFile(filePath);
  if (!result.ok) {
    if (result.reason !== "missing") {
      errors.push({ file: filePath, message: result.message });
    }
    return emptyRunnerSummary();
  }

  const validation = validateRunnerJson(result.data);
  if (!validation.ok) {
    errors.push({ file: filePath, message: validation.errors.join("; ") });
    return emptyRunnerSummary();
  }

  return normalizeRunnerMetadata(result.data);
}

function annotateRunnerTaskRegistration(
  runner: RunnerSummary,
  queue: Record<QueueSection, TaskQueueItem[]>,
  currentTaskId: string | null,
  repoPath: string,
  layout: HarnessLayout,
  errors: HarnessError[],
): RunnerSummary {
  const taskId = runner.taskId?.trim();
  const claimsWork = Boolean(taskId && ["running", "stale", "blocked", "waiting_for_human"].includes(runner.status));

  if (!claimsWork || !taskId) {
    return { ...runner, taskRegistrationStatus: "none", taskRegistrationMessage: null };
  }

  const activeTaskIds = new Set(queue.active.map((item) => item.taskId.trim()).filter(Boolean));
  const allTaskIds = new Set(Object.values(queue).flatMap((items) => items.map((item) => item.taskId.trim()).filter(Boolean)));

  if (activeTaskIds.has(taskId)) {
    if (currentTaskId !== taskId) {
      const message = currentTaskId
        ? `Runner task ${taskId} is active but harness state currentTask is ${currentTaskId}.`
        : `Runner task ${taskId} is active but harness state currentTask is missing.`;
      errors.push({ file: path.join(repoPath, layout.runnerJson), message });
      return { ...runner, taskRegistrationStatus: "mismatched", taskRegistrationMessage: message };
    }
    return { ...runner, taskRegistrationStatus: "active", taskRegistrationMessage: null };
  }

  const message = allTaskIds.has(taskId)
    ? `Runner task ${taskId} is registered but is not in the Active queue.`
    : `Runner task ${taskId} is not registered in the queue or tasks directory.`;

  errors.push({ file: path.join(repoPath, layout.runnerJson), message });

  return {
    ...runner,
    taskRegistrationStatus: allTaskIds.has(taskId) ? "inactive" : "missing",
    taskRegistrationMessage: message,
  };
}

function readStateCurrentTaskId(state: unknown): string | null {
  if (!isRecord(state) || !isRecord(state.currentTask) || typeof state.currentTask.taskId !== "string") {
    return null;
  }

  const taskId = state.currentTask.taskId.trim();
  return taskId || null;
}

async function readDevelopmentMetadata(repoPath: string, configuredRoots: string[], layout: HarnessLayout, errors: HarnessError[]): Promise<DevelopmentMetadata | null> {
  const relativePath = layout.developmentJson;
  let filePath: string;
  try {
    filePath = await resolveReadableRepoFile(repoPath, configuredRoots, relativePath);
  } catch (error) {
    errors.push({ file: path.join(repoPath, relativePath), message: error instanceof Error ? error.message : String(error) });
    return null;
  }

  const result = await readJsonFile(filePath);
  if (!result.ok) {
    if (result.reason !== "missing") {
      errors.push({ file: filePath, message: result.message });
    }
    return null;
  }

  const validation = validateDevelopmentJson(result.data);
  if (!validation.ok) {
    errors.push({ file: filePath, message: validation.errors.join("; ") });
    return null;
  }

  return normalizeDevelopmentMetadata(result.data);
}

function repoPathFromInput(input: DetectionMode | ProjectDetailInput): string {
  if (typeof input === "string") {
    throw new Error("Project detail input is required");
  }
  const repoPath = input.repoPath || input.projectId;
  if (!repoPath) {
    throw new Error("repoPath or projectId is required");
  }
  return repoPath;
}

async function readHarnessJson(
  repoPath: string,
  configuredRoots: string[],
  layout: HarnessLayout,
  file: ".agent/manifest.json" | ".agent/state.json" | ".agent/queue.json",
  errors: HarnessError[],
): Promise<{ ok: boolean; data: unknown; revision: string | null }> {
  const relativePath = harnessJsonRelativePath(layout, file);
  let filePath: string;
  try {
    filePath = (await resolveReadableHarnessJsonFile(repoPath, configuredRoots, file)).filePath;
  } catch (error) {
    errors.push({ file: path.join(repoPath, relativePath), message: error instanceof Error ? error.message : String(error) });
    return { ok: false, data: null, revision: null };
  }
  const result = await readJsonFile(filePath);
  if (!result.ok) {
    errors.push({ file: filePath, message: result.message });
    return { ok: false, data: null, revision: result.revision };
  }
  return { ok: true, data: result.data, revision: result.revision };
}

function readProjectName(manifest: unknown, repoPath: string): string {
  if (isRecord(manifest) && isRecord(manifest.project) && typeof manifest.project.name === "string" && manifest.project.name.trim()) {
    return manifest.project.name;
  }
  return path.basename(repoPath);
}

function readRepoUrl(source: unknown): string | null {
  if (!isRecord(source)) return null;
  const repository = isRecord(source.repository) ? source.repository : source;
  for (const key of ["githubUrl", "remoteOrigin"] as const) {
    if (typeof repository[key] === "string" && repository[key].trim() && repository[key] !== "unknown") {
      return repository[key].trim();
    }
  }
  return null;
}

function readUrls(stateOk: boolean, state: unknown, manifest: unknown): UrlFields {
  if (!stateOk) {
    return { localUrl: null, testUrl: null, deploymentUrl: null };
  }
  const stateUrls = isRecord(state) && isRecord(state.project) ? normalizeUrlFields(state.project) : normalizeUrlFields(null);
  const manifestUrls = isRecord(manifest) && isRecord(manifest.runtime) ? normalizeUrlFields(manifest.runtime) : normalizeUrlFields(null);
  return {
    localUrl: stateUrls.localUrl ?? manifestUrls.localUrl,
    testUrl: stateUrls.testUrl ?? manifestUrls.testUrl,
    deploymentUrl: stateUrls.deploymentUrl ?? manifestUrls.deploymentUrl,
  };
}

function normalizeQueue(data: unknown): Record<QueueSection, TaskQueueItem[]> {
  const empty = { active: [], backlog: [], done: [] };
  if (!isRecord(data)) return empty;
  return {
    active: readQueueSection(data.active, "active"),
    backlog: readQueueSection(data.backlog, "backlog"),
    done: readQueueSection(data.done, "done"),
  };
}

function readQueueSection(value: unknown, section: QueueSection): TaskQueueItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const queueItem = asQueueItem(item, defaultQueueSectionValues(section));
    return queueItem ? [queueItem] : [];
  });
}

function defaultQueueSectionValues(section: QueueSection): Partial<Pick<TaskQueueItem, "phase" | "status">> {
  if (section === "backlog") return { phase: "backlog", status: "backlog" };
  if (section === "done") return { phase: "done", status: "done" };
  return {};
}

async function mergeTaskDirectoryQueue(
  repoPath: string,
  containingRoot: string,
  configuredRoots: string[],
  layout: HarnessLayout,
  queue: Record<QueueSection, TaskQueueItem[]>,
  errors: HarnessError[],
): Promise<Record<QueueSection, TaskQueueItem[]>> {
  const discovered = await readTaskDirectoryItems(repoPath, containingRoot, configuredRoots, layout, errors);
  if (!discovered.length) return queue;

  const discoveredById = new Map(discovered.map((item) => [item.taskId, item]));
  const next: Record<QueueSection, TaskQueueItem[]> = {
    active: [],
    backlog: [],
    done: [],
  };
  const seen = new Set<string>();
  const doneTaskIds = new Set(queue.done.map((item) => item.taskId));

  for (const item of Object.values(queue).flat()) {
    const statusItem = discoveredById.get(item.taskId);
    const merged = statusItem ? mergeQueueStatusItem(item, statusItem) : item;
    const section = queueSectionForTask(merged, doneTaskIds);
    next[section].push(merged);
    if (section === "done") {
      doneTaskIds.add(merged.taskId);
    }
    seen.add(merged.taskId);
  }

  for (const item of discovered) {
    if (seen.has(item.taskId)) continue;
    seen.add(item.taskId);
    const section = queueSectionForTask(item, doneTaskIds);
    next[section].push(item);
    if (section === "done") {
      doneTaskIds.add(item.taskId);
    }
  }

  return next;
}

function mergeQueueStatusItem(queueItem: TaskQueueItem, statusItem: TaskQueueItem): TaskQueueItem {
  return {
    ...queueItem,
    source: statusItem.source,
    taskId: statusItem.taskId,
    title: statusItem.title === statusItem.taskId ? queueItem.title : statusItem.title,
    phase: statusItem.phase === "unknown" ? queueItem.phase : statusItem.phase,
    status: statusItem.phase === "unknown" ? queueItem.status : statusItem.status,
    priority: statusItem.priority ?? queueItem.priority,
    dependsOn: statusItem.dependsOn.length ? statusItem.dependsOn : queueItem.dependsOn,
  };
}

function queueSectionForTask(item: TaskQueueItem, doneTaskIds: Set<string>): QueueSection {
  const phase = item.phase.trim().toLowerCase();
  const status = item.status.trim().toLowerCase();
  if (phase === "done" || status === "done") return "done";
  if (phase === "backlog" || status === "backlog" || phase === "todo" || phase === "not_started") return "backlog";
  if (item.dependsOn.some((taskId) => !doneTaskIds.has(taskId))) return "backlog";
  return isActiveTaskPhase(phase) ? "active" : "backlog";
}

function isActiveTaskPhase(phase: string): boolean {
  return [
    "intake",
    "spec",
    "design",
    "design_review",
    "design_revision",
    "contract",
    "coding",
    "implementation",
    "code_review",
    "code_revision",
    "verification",
    "docs_update",
    "blocked",
  ].includes(phase);
}

async function readTaskDirectoryItems(
  repoPath: string,
  containingRoot: string,
  configuredRoots: string[],
  layout: HarnessLayout,
  errors: HarnessError[],
): Promise<TaskQueueItem[]> {
  const tasksPath = path.join(repoPath, layout.tasksDir);
  let entries: import("node:fs").Dirent[];
  try {
    const stat = await fs.lstat(tasksPath);
    if (!stat.isDirectory() || stat.isSymbolicLink()) {
      errors.push({ file: tasksPath, message: "Tasks directory is not a readable directory" });
      return [];
    }
    const realTasksPath = await fs.realpath(tasksPath);
    if (!isPathInside(repoPath, realTasksPath) || !isPathInside(containingRoot, realTasksPath)) {
      errors.push({ file: tasksPath, message: "Tasks directory resolves outside the allowed boundary" });
      return [];
    }
    entries = await fs.readdir(realTasksPath, { withFileTypes: true });
  } catch (error) {
    if (isMissingPathError(error)) return [];
    errors.push({ file: tasksPath, message: error instanceof Error ? error.message : String(error) });
    return [];
  }

  const items = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory() && !entry.isSymbolicLink() && !entry.name.startsWith("_") && /^[A-Za-z0-9._-]+$/.test(entry.name))
      .map(async (entry) => {
        const statusPath = path.join(layout.tasksDir, entry.name, "status.md");
        let safePath: string;
        try {
          safePath = await resolveReadableRepoFile(repoPath, configuredRoots, statusPath);
        } catch (error) {
          errors.push({ file: path.join(repoPath, statusPath), message: error instanceof Error ? error.message : String(error) });
          return null;
        }
        const statusMarkdown = await fs.readFile(safePath, "utf8").catch(() => null);
        if (!statusMarkdown) return null;
        return queueItemFromStatusMarkdown(entry.name, statusMarkdown);
      }),
  );

  return items.filter((item): item is TaskQueueItem => Boolean(item));
}

function queueItemFromStatusMarkdown(directoryName: string, statusMarkdown: string): TaskQueueItem {
  const taskId = readStatusField(statusMarkdown, "Task ID") || directoryName;
  const title = readStatusField(statusMarkdown, "Title") || taskId;
  const phase = readStatusField(statusMarkdown, "Phase") || "unknown";
  const priorityValue = readStatusField(statusMarkdown, "Priority");
  const priority = priorityValue ? Number(priorityValue) : undefined;
  return {
    taskId,
    title,
    phase,
    status: phase === "done" ? "done" : phase,
    priority: Number.isFinite(priority) ? priority : undefined,
    dependsOn: readDependsOn(readStatusField(statusMarkdown, "Depends On")),
    source: "tasks-directory",
  };
}

function readStatusField(markdown: string, field: string): string | null {
  const target = field.toLowerCase();
  for (const line of markdown.split(/\r?\n/)) {
    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
    const [name, rawValue] = cells;
    if (!name || rawValue === undefined || name.toLowerCase() !== target) continue;
    const value = rawValue.replace(/`/g, "").trim();
    if (!value || value.toLowerCase() === "none") return null;
    return value;
  }
  return null;
}

function readDependsOn(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(/[,\s]+/)
    .map((item) => item.replace(/`/g, "").trim())
    .filter((item) => item && item.toLowerCase() !== "none");
}

function normalizeActiveTask(queue: Record<QueueSection, TaskQueueItem[]>, state: unknown): ActiveTaskSummary | null {
  const queueTask = queue.active[0];
  if (queueTask) {
    return {
      taskId: queueTask.taskId,
      title: queueTask.title,
      phase: queueTask.phase,
      status: queueTask.status,
      priority: typeof queueTask.priority === "number" ? queueTask.priority : null,
      gateStatus: readGateStatus(queueTask),
      requiresUserAction: readRequiresUserAction(queueTask),
      userActionReason: readUserActionReason(queueTask),
    };
  }
  if (isRecord(state) && isRecord(state.currentTask) && typeof state.currentTask.taskId === "string") {
    const currentTask = state.currentTask;
    const taskId = String(currentTask.taskId).trim();
    if (!taskId) return null;
    const matchingQueueTask = Object.values(queue).flat().find((item) => item.taskId === taskId);
    const phase = typeof currentTask.phase === "string" ? currentTask.phase : matchingQueueTask?.phase ?? "unknown";
    return {
      taskId,
      title: matchingQueueTask?.title ?? taskId,
      phase,
      status: typeof currentTask.status === "string" ? currentTask.status : matchingQueueTask?.status ?? null,
      priority: typeof matchingQueueTask?.priority === "number" ? matchingQueueTask.priority : null,
      gateStatus: matchingQueueTask ? readGateStatus(matchingQueueTask) : "unknown",
      requiresUserAction: readRequiresUserAction(currentTask),
      userActionReason: readUserActionReason(currentTask),
    };
  }
  return null;
}

function readGateStatus(task: TaskQueueItem): GateStatus {
  if (task.gateStatus === "pass" || task.gateStatus === "pending" || task.gateStatus === "blocked" || task.gateStatus === "unknown") {
    return task.gateStatus;
  }
  if (task.status === "blocked") return "blocked";
  return "unknown";
}

function readRequiresUserAction(source: Record<string, unknown>): boolean {
  return source.requiresUserAction === true || source.userActionRequired === true;
}

function readUserActionReason(source: Record<string, unknown>): string | null {
  for (const key of ["userActionReason", "userAction", "approvalReason"]) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

async function readTaskArtifacts(repoPath: string, configuredRoots: string[], layout: HarnessLayout, taskId: string, errors: HarnessError[]): Promise<TaskArtifacts> {
  if (!/^[A-Za-z0-9._-]+$/.test(taskId)) {
    errors.push({ file: path.join(repoPath, layout.tasksDir, taskId), message: "Task id contains unsafe path characters" });
    return emptyTaskArtifacts();
  }
  const entries = await Promise.all(
    Object.entries(artifactFiles).map(async ([key, file]) => {
      const relativePath = path.join(layout.tasksDir, taskId, file);
      let safePath: string;
      try {
        safePath = await resolveReadableRepoFile(repoPath, configuredRoots, relativePath);
      } catch (error) {
        errors.push({ file: path.join(repoPath, relativePath), message: error instanceof Error ? error.message : String(error) });
        return [key, null] as const;
      }
      const content = await fs.readFile(safePath, "utf8").catch((error) => {
        if (!isMissingPathError(error)) {
          errors.push({ file: safePath, message: error instanceof Error ? error.message : String(error) });
        }
        return null;
      });
      return [key, content] as const;
    }),
  );
  return Object.fromEntries(entries) as TaskArtifacts;
}

function emptyTaskArtifacts(): TaskArtifacts {
  return Object.fromEntries(Object.keys(artifactFiles).map((key) => [key, null])) as TaskArtifacts;
}

function readRecentDecisions(state: unknown): RecentDecision[] {
  if (!isRecord(state) || !Array.isArray(state.recentDecisions)) return [];
  return state.recentDecisions.flatMap((item) => {
    if (!isRecord(item)) return [];
    if (typeof item.date !== "string" || typeof item.decision !== "string") return [];
    return [{ date: item.date, decision: item.decision, source: typeof item.source === "string" ? item.source : "" }];
  });
}

function unsafeProjectDetail(repoPath: string, detection: DetectionMode, message: string): ProjectDetail {
  return {
    id: repoPath,
    name: path.basename(repoPath),
    path: repoPath,
    detection,
    repoUrl: null,
    currentBranch: null,
    dirtyWorktree: null,
    activeTask: null,
    runner: emptyRunnerSummary(),
    localUrl: null,
    testUrl: null,
    deploymentUrl: null,
    errors: [{ file: repoPath, message }],
    harnessTemplate: null,
    legacyHarnessCleanup: null,
    queue: { active: [], backlog: [], done: [] },
    currentTask: null,
    taskArtifacts: {},
    recentDecisions: [],
    gitHistory: [],
    development: null,
    revisions: { manifest: null, state: null, queue: null },
  };
}

function isMissingPathError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: unknown }).code === "ENOENT";
}
