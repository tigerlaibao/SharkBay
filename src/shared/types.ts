export type DetectionMode = "manifest" | "protocol-fallback";

export type HarnessLayoutKind = "contained" | "legacy";

export type GateStatus = "pass" | "pending" | "blocked" | "unknown";

export type QueueSection = "active" | "backlog" | "done";

export type HarnessJsonFile =
  | ".agent/manifest.json"
  | ".agent/state.json"
  | ".agent/queue.json";

export type UrlField = "localUrl" | "testUrl" | "deploymentUrl";

export type UrlFields = Record<UrlField, string | null>;

export type RevisionToken = string;

export type AppearanceTheme = "day" | "night" | "morning";

export type AppConfig = {
  schemaVersion: 1;
  configuredRoots: string[];
  appearanceTheme: AppearanceTheme;
  updatedAt: string;
};

export type IpcRuntimeLike = {
  userDataPath: string;
  templateRoot?: string;
};

export type RootConfigInput = {
  path?: string;
  rootPath?: string;
};

export type RemoveRootInput = RootConfigInput;

export type AppearanceThemeInput = {
  theme: AppearanceTheme;
};

export type ProjectScanInput = {
  configuredRoots?: string[];
  maxDepth?: number;
};

export type ProjectDetailInput = {
  projectId?: string;
  repoPath?: string;
  detection?: DetectionMode;
};

export type ProjectFilesInput = {
  repoPath: string;
  configuredRoots?: string[];
};

export type RootScanResult = {
  inputPath: string;
  path: string | null;
  available: boolean;
  error: string | null;
};

export type TaskQueueItem = {
  priority?: number;
  taskId: string;
  title: string;
  phase: string;
  dependsOn: string[];
  status: string;
  gateStatus?: GateStatus;
  [key: string]: unknown;
};

export type ActiveTaskSummary = {
  taskId: string;
  title: string;
  phase: string;
  status: string | null;
  priority: number | null;
  gateStatus: GateStatus;
  requiresUserAction: boolean;
  userActionReason: string | null;
};

export type ProjectTaskStatusKind = "active" | "ready" | "backlog" | "done" | "idle" | "unknown";

export type ProjectTaskStatus = {
  kind: ProjectTaskStatusKind;
  label: string;
  taskId: string | null;
  title: string | null;
  phase: string | null;
  counts: Record<QueueSection, number>;
};

export type RunnerStatus = "unknown" | "idle" | "running" | "stale" | "blocked" | "waiting_for_human";
export type RunnerTaskRegistrationStatus = "none" | "active" | "inactive" | "missing" | "mismatched";

export type RunnerSummary = {
  schemaVersion: number | null;
  status: RunnerStatus;
  rawStatus: string | null;
  sessionId: string | null;
  owner: string | null;
  taskId: string | null;
  phase: string | null;
  startedAt: string | null;
  heartbeatAt: string | null;
  message: string | null;
  reason: string | null;
  stale: boolean;
  staleAfterSeconds: number;
  taskRegistrationStatus: RunnerTaskRegistrationStatus;
  taskRegistrationMessage: string | null;
};

export type HarnessError = {
  file: string;
  message: string;
};

export type HarnessTemplateSyncSummary = {
  status: HarnessTemplateSyncStatus;
  currentVersion: string;
  installedVersion: string | null;
  staleFiles: string[];
  missingFiles: string[];
};

export type LegacyHarnessCleanupStatus = "not_needed" | "ready" | "blocked";

export type LegacyHarnessCleanupMove = {
  source: string;
  target: string;
  kind: "file" | "directory";
};

export type LegacyHarnessCleanupSummary = {
  status: LegacyHarnessCleanupStatus;
  message: string;
  moves: LegacyHarnessCleanupMove[];
  blockers: string[];
};

export type ProjectIconSource = {
  kind: "local" | "favicon";
  url: string;
  label: string;
};

export type ProjectDevService = {
  id: string;
  label: string;
  command: string;
  script: string;
  cwd: string;
};

export type ProjectFileTreeItem = {
  name: string;
  path: string;
  kind: "directory" | "file";
  editable: boolean;
  children?: ProjectFileTreeItem[];
};

export type ProjectFilesResult =
  | {
      ok: true;
      repoPath: string;
      files: ProjectFileTreeItem[];
    }
  | {
      ok: false;
      reason: "unsafe-path" | "io-error";
      message: string;
    };

export type ProjectSummary = {
  id: string;
  name: string;
  path: string;
  detection: DetectionMode;
  iconSources: ProjectIconSource[];
  repoUrl: string | null;
  currentBranch: string | null;
  dirtyWorktree: boolean | null;
  activeTask: ActiveTaskSummary | null;
  taskStatus: ProjectTaskStatus;
  runner: RunnerSummary;
  localUrl: string | null;
  testUrl: string | null;
  deploymentUrl: string | null;
  errors: HarnessError[];
  harnessTemplate: HarnessTemplateSyncSummary | null;
  legacyHarnessCleanup: LegacyHarnessCleanupSummary | null;
};

export type ProjectCandidate = {
  id: string;
  name: string;
  path: string;
  rootPath: string;
  iconSources: ProjectIconSource[];
  status: "managed" | "not_setup";
  managedProjectId: string | null;
  detection: DetectionMode | null;
  services: ProjectDevService[];
};

export type TaskArtifacts = {
  statusMarkdown: string | null;
  specMarkdown: string | null;
  designMarkdown: string | null;
  designReviewMarkdown: string | null;
  contractMarkdown: string | null;
  codeReviewMarkdown: string | null;
  verificationMarkdown: string | null;
  decisionsMarkdown: string | null;
  implementationMarkdown: string | null;
};

export type RecentDecision = {
  date: string;
  decision: string;
  source: string;
};

export type DevelopmentEndpoint = {
  label: string;
  url: string | null;
  ports: number[];
  source?: string | null;
};

export type DevelopmentPort = {
  port: number;
  protocol: string | null;
  purpose: string | null;
  status: string | null;
};

export type DevelopmentEnvironment = {
  packageManager: string | null;
  setupCommands: string[];
  requiredEnvFiles: string[];
};

export type DevelopmentMetadata = {
  schemaVersion: number | null;
  updatedAt: string | null;
  maintainedBy: string | null;
  stack: Record<string, string[]>;
  environment: DevelopmentEnvironment;
  commands: Record<string, string[]>;
  endpoints: Record<"local" | "test" | "production", DevelopmentEndpoint[]>;
  ports: DevelopmentPort[];
  tools: string[];
  notes: string[];
};

export type GitEvent = {
  hash: string;
  selector: string;
  action: string;
  date: string;
};

export type RevisionMap = {
  manifest: RevisionToken | null;
  state: RevisionToken | null;
  queue: RevisionToken | null;
};

export type ProjectDetail = ProjectSummary & {
  queue: Record<QueueSection, TaskQueueItem[]>;
  currentTask: TaskArtifacts | null;
  taskArtifacts: Record<string, TaskArtifacts>;
  recentDecisions: RecentDecision[];
  gitHistory: GitEvent[];
  development: DevelopmentMetadata | null;
  revisions: RevisionMap;
};

export type ScanProjectsResult = {
  roots: RootScanResult[];
  projects: ProjectSummary[];
  candidates: ProjectCandidate[];
};

export type UpdateProjectUrlsInput = {
  repoPath: string;
  configuredRoots: string[];
  expectedRevision: RevisionToken;
  urls: Partial<UrlFields>;
};

export type HarnessJsonPatchInput = Omit<HarnessWriteInput, "file" | "configuredRoots"> & {
  configuredRoots?: string[];
};

export type SafeWriteResult = HarnessWriteResult;

export type GitMirrorPatch = {
  type: "updateGitMirror";
  repository: Partial<{
    isGitRepository: boolean;
    gitRoot: string;
    currentBranch: string | null;
    defaultBranch: string | null;
    remoteOrigin: string | null;
    githubUrl: string | null;
    dirtyWorktree: boolean | null;
  }>;
};

export type StateUrlsPatch = {
  type: "updateProjectUrls";
  urls: Partial<UrlFields>;
};

export type StateCurrentTaskPatch = {
  type: "updateCurrentTask";
  currentTask: Partial<{
    taskId: string;
    phase: string;
    nextAction: string;
    blockedBy: string[];
  }>;
};

export type StateDecisionPatch = {
  type: "appendRecentDecision";
  decision: RecentDecision;
};

export type ManifestIdentityPatch = {
  type: "updateManifestIdentity";
  project?: Partial<{
    name: string;
    slug: string;
    type: string;
    description: string;
    domain: string;
  }>;
  repository?: Partial<{
    path: string;
    gitRoot: string;
    remoteOrigin: string | null;
    githubUrl: string | null;
    defaultBranch: string | null;
  }>;
};

export type ManifestRuntimeUrlsPatch = {
  type: "updateManifestRuntimeUrls";
  urls: Partial<UrlFields>;
};

export type QueueTaskPatch = {
  type: "updateQueueTask";
  section: QueueSection;
  taskId: string;
  changes: Partial<Pick<TaskQueueItem, "priority" | "taskId" | "title" | "phase" | "dependsOn" | "status">>;
};

export type HarnessPatch =
  | GitMirrorPatch
  | StateUrlsPatch
  | StateCurrentTaskPatch
  | StateDecisionPatch
  | ManifestIdentityPatch
  | ManifestRuntimeUrlsPatch
  | QueueTaskPatch;

export type HarnessWriteInput = {
  repoPath: string;
  configuredRoots: string[];
  file: HarnessJsonFile;
  expectedRevision: RevisionToken;
  patch: HarnessPatch;
};

export type HarnessWriteSuccess = {
  ok: true;
  file: HarnessJsonFile;
  revision: RevisionToken;
  data: unknown;
};

export type HarnessWriteFailure = {
  ok: false;
  reason:
    | "conflict"
    | "invalid-json"
    | "invalid-schema"
    | "unsupported-patch"
    | "unsafe-path"
    | "io-error";
  message: string;
  latestRevision?: RevisionToken;
  latestData?: unknown;
  errors?: string[];
};

export type HarnessWriteResult = HarnessWriteSuccess | HarnessWriteFailure;

export type GitMetadata = {
  isGitRepository: boolean;
  gitRoot: string | null;
  currentBranch: string | null;
  defaultBranch: string | null;
  remoteOrigin: string | null;
  githubUrl: string | null;
  dirtyWorktree: boolean | null;
};

export type CreateHarnessRepoInput = {
  targetDir: string;
  configuredRoots?: string[];
  projectName: string;
  projectSlug?: string;
  description?: string;
  templateDir?: string;
  allowExistingDirectory?: boolean;
};

export type CreateHarnessRepoResult =
  | {
      ok: true;
      path: string;
      files: string[];
    }
  | {
      ok: false;
      reason: "non-empty-target" | "existing-harness" | "file-collision" | "unsafe-path" | "template-missing" | "io-error";
      message: string;
    };

export type HarnessTemplateOwnedFile = {
  path: string;
  sha256: string;
};

export type HarnessTemplateSyncMetadata = {
  schemaVersion: 1;
  source: "sharkbay/templates/harness";
  version: string;
  updatedAt: string;
  versionOwnedFiles: HarnessTemplateOwnedFile[];
};

export type HarnessTemplateFileSyncStatus = "current" | "stale" | "missing";

export type HarnessTemplateFileCheck = HarnessTemplateOwnedFile & {
  status: HarnessTemplateFileSyncStatus;
  installedSha256: string | null;
};

export type HarnessTemplateSyncStatus = "current" | "stale" | "missing" | "unknown";

export type HarnessTemplateSyncCheckInput = {
  repoPath: string;
  configuredRoots?: string[];
  templateDir?: string;
};

export type HarnessTemplateSyncCheckResult =
  | {
      ok: true;
      repoPath: string;
      status: HarnessTemplateSyncStatus;
      currentVersion: string;
      installedVersion: string | null;
      metadataPath: string;
      files: HarnessTemplateFileCheck[];
    }
  | {
      ok: false;
      reason: "unsafe-path" | "template-missing" | "io-error";
      message: string;
    };

export type HarnessTemplateSyncUpdateInput = HarnessTemplateSyncCheckInput;

export type HarnessTemplateSyncUpdateResult =
  | {
      ok: true;
      repoPath: string;
      status: "current";
      version: string;
      files: string[];
      metadataPath: string;
    }
  | {
      ok: false;
      reason: "unsafe-path" | "template-missing" | "io-error";
      message: string;
    };

export type LegacyHarnessCleanupCheckInput = {
  repoPath: string;
  configuredRoots?: string[];
};

export type LegacyHarnessCleanupCheckResult =
  | ({
      ok: true;
      repoPath: string;
    } & LegacyHarnessCleanupSummary)
  | {
      ok: false;
      reason: "unsafe-path" | "io-error";
      message: string;
    };

export type LegacyHarnessCleanupMigrationResult =
  | {
      ok: true;
      repoPath: string;
      status: "migrated";
      moves: LegacyHarnessCleanupMove[];
      removedLegacyDirs: string[];
    }
  | {
      ok: false;
      reason: "unsafe-path" | "blocked" | "io-error";
      message: string;
      blockers?: string[];
    };

export type HarnessUninstallInput = {
  repoPath: string;
  configuredRoots?: string[];
};

export type HarnessUninstallResult =
  | {
      ok: true;
      repoPath: string;
      removedPaths: string[];
      skippedPaths: string[];
      gitignoreRemovedLines: string[];
    }
  | {
      ok: false;
      reason: "unsafe-path" | "blocked" | "io-error";
      message: string;
      blockers?: string[];
    };

export type PromptGenerationInput = {
  project: Pick<ProjectDetail, "name" | "path" | "activeTask" | "currentTask">;
  taskId?: string;
  phase?: string;
  requiredChecks?: string[];
  stopConditions?: string[];
};

export type NextActionPromptInput = {
  projectId?: string;
  repoPath?: string;
  taskId?: string;
  phase?: string;
  project?: Pick<ProjectDetail, "name" | "path" | "activeTask" | "currentTask">;
  requiredChecks?: string[];
  stopConditions?: string[];
};

export type NextActionPromptResult = {
  prompt: string;
};

export type TerminalSessionStatus = "running" | "exited";

export type TerminalCreateInput = {
  cwd: string;
  title?: string;
  initialCommand?: string;
  service?: {
    id: string;
    label: string;
    command: string;
  };
  cols?: number;
  rows?: number;
};

export type TerminalSession = {
  id: string;
  cwd: string;
  title: string;
  shell: string;
  pid: number | null;
  status: TerminalSessionStatus;
  createdAt: string;
  service?: {
    id: string;
    label: string;
    command: string;
  };
};

export type TerminalInput = {
  sessionId: string;
  data: string;
};

export type TerminalResizeInput = {
  sessionId: string;
  cols: number;
  rows: number;
};

export type TerminalCloseInput = {
  sessionId: string;
};

export type TerminalDataEvent = {
  sessionId: string;
  data: string;
  stream: "stdout" | "stderr";
};

export type TerminalExitEvent = {
  sessionId: string;
  exitCode: number | null;
  signal: string | null;
};

export type TerminalUpdateEvent = {
  session: TerminalSession;
};
