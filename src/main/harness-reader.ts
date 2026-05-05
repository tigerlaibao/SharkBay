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
import { readJsonFile } from "./json-file.js";
import { resolveReadableHarnessJsonFile, resolveReadableRepoFile, resolveRepoPath } from "./path-safety.js";

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

export async function readProjectSummary(repoPath: string, detection: DetectionMode, configuredRoots?: string[]): Promise<ProjectSummary> {
  const detail = await readProjectDetail(repoPath, detection, { includeArtifacts: false, configuredRoots });
  const {
    queue: _queue,
    currentTask: _currentTask,
    recentDecisions: _decisions,
    gitHistory: _gitHistory,
    development: _development,
    revisions: _revisions,
    ...summary
  } = detail;
  return summary;
}

export function readProjectDetail(repoPath: string, detection: DetectionMode, options?: { includeArtifacts?: boolean; configuredRoots?: string[] }): Promise<ProjectDetail>;
export function readProjectDetail(runtime: IpcRuntimeLike, input: ProjectDetailInput): Promise<ProjectDetail>;
export async function readProjectDetail(
  first: string | IpcRuntimeLike,
  second: DetectionMode | ProjectDetailInput,
  options: { includeArtifacts?: boolean; configuredRoots?: string[] } = {},
): Promise<ProjectDetail> {
  const rawRepoPath = typeof first === "string" ? first : repoPathFromInput(second);
  const detection = typeof second === "string" ? second : second.detection ?? "manifest";
  const configuredRoots = typeof first === "string"
    ? options.configuredRoots ?? [rawRepoPath]
    : (await loadAppConfig(getRuntimeConfigPath(first))).configuredRoots;
  const errors: HarnessError[] = [];
  let repoPath: string;
  try {
    repoPath = (await resolveRepoPath(rawRepoPath, configuredRoots)).repoPath;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return unsafeProjectDetail(rawRepoPath, detection, message);
  }

  const manifest = await readHarnessJson(repoPath, configuredRoots, ".agent/manifest.json", errors);
  const state = await readHarnessJson(repoPath, configuredRoots, ".agent/state.json", errors);
  const queueJson = await readHarnessJson(repoPath, configuredRoots, ".agent/queue.json", errors);
  const git = await readGitMetadata(repoPath);
  const gitHistory = await readGitHistory(repoPath);
  const development = await readDevelopmentMetadata(repoPath, configuredRoots, errors);
  const runner = await readRunnerMetadata(repoPath, configuredRoots, errors);

  const queue = normalizeQueue(queueJson.data);
  const activeTask = normalizeActiveTask(queue.active[0], state.data);
  const urls = readUrls(state.ok, state.data, manifest.data);
  const name = readProjectName(manifest.data, repoPath);
  const repoUrl = readRepoUrl(state.data) || readRepoUrl(manifest.data) || git.githubUrl;
  const currentTask = options.includeArtifacts === false || !activeTask ? null : await readTaskArtifacts(repoPath, configuredRoots, activeTask.taskId, errors);
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
    queue,
    currentTask,
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

async function readRunnerMetadata(repoPath: string, configuredRoots: string[], errors: HarnessError[]): Promise<RunnerSummary> {
  const relativePath = ".agent/runner.json";
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

async function readDevelopmentMetadata(repoPath: string, configuredRoots: string[], errors: HarnessError[]): Promise<DevelopmentMetadata | null> {
  const relativePath = ".agent/development.json";
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

async function readHarnessJson(repoPath: string, configuredRoots: string[], file: ".agent/manifest.json" | ".agent/state.json" | ".agent/queue.json", errors: HarnessError[]): Promise<{ ok: boolean; data: unknown; revision: string | null }> {
  let filePath: string;
  try {
    filePath = (await resolveReadableHarnessJsonFile(repoPath, configuredRoots, file)).filePath;
  } catch (error) {
    errors.push({ file: path.join(repoPath, file), message: error instanceof Error ? error.message : String(error) });
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
    active: readQueueSection(data.active),
    backlog: readQueueSection(data.backlog),
    done: readQueueSection(data.done),
  };
}

function readQueueSection(value: unknown): TaskQueueItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const queueItem = asQueueItem(item);
    return queueItem ? [queueItem] : [];
  });
}

function normalizeActiveTask(queueTask: TaskQueueItem | undefined, state: unknown): ActiveTaskSummary | null {
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
    return {
      taskId: state.currentTask.taskId,
      title: state.currentTask.taskId,
      phase: typeof state.currentTask.phase === "string" ? state.currentTask.phase : "unknown",
      status: typeof state.currentTask.status === "string" ? state.currentTask.status : null,
      priority: null,
      gateStatus: "unknown",
      requiresUserAction: readRequiresUserAction(state.currentTask),
      userActionReason: readUserActionReason(state.currentTask),
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

async function readTaskArtifacts(repoPath: string, configuredRoots: string[], taskId: string, errors: HarnessError[]): Promise<TaskArtifacts> {
  if (!/^[A-Za-z0-9._-]+$/.test(taskId)) {
    errors.push({ file: path.join(repoPath, "tasks", taskId), message: "Task id contains unsafe path characters" });
    return emptyTaskArtifacts();
  }
  const entries = await Promise.all(
    Object.entries(artifactFiles).map(async ([key, file]) => {
      const relativePath = path.join("tasks", taskId, file);
      let safePath: string;
      try {
        safePath = await resolveReadableRepoFile(repoPath, configuredRoots, relativePath);
      } catch (error) {
        errors.push({ file: path.join(repoPath, relativePath), message: error instanceof Error ? error.message : String(error) });
        return [key, null] as const;
      }
      const content = await fs.readFile(safePath, "utf8").catch(() => null);
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
    if (typeof item.date !== "string" || typeof item.decision !== "string" || typeof item.source !== "string") return [];
    return [{ date: item.date, decision: item.decision, source: item.source }];
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
    queue: { active: [], backlog: [], done: [] },
    currentTask: null,
    recentDecisions: [],
    gitHistory: [],
    development: null,
    revisions: { manifest: null, state: null, queue: null },
  };
}
