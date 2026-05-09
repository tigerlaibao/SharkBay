export type GateStatus = "pass" | "pending" | "blocked" | "unknown";

export type DetectionMode = "manifest" | "protocol-fallback";

export type AppearanceTheme = "day" | "night" | "morning";

export type RootRecord = {
  path: string;
  inputPath?: string;
  available?: boolean;
  unavailable?: boolean;
  error?: string | null;
};

export type AppConfig = {
  schemaVersion?: number;
  configuredRoots: string[];
  appearanceTheme?: AppearanceTheme;
  updatedAt?: string;
};

export type TaskQueueItem = {
  priority?: number;
  taskId: string;
  title?: string;
  phase?: string;
  dependsOn?: string[];
  status?: string;
  notes?: string;
  completed?: string;
  completedAt?: string;
};

export type ActiveTaskSummary = {
  taskId: string;
  title?: string;
  phase: string;
  status?: string | null;
  priority?: number;
  gateStatus?: GateStatus;
  requiresUserAction?: boolean;
  userActionReason?: string | null;
};

export type ProjectTaskStatusKind = "active" | "ready" | "backlog" | "done" | "idle" | "unknown";

export type ProjectTaskStatus = {
  kind: ProjectTaskStatusKind;
  label: string;
  taskId: string | null;
  title: string | null;
  phase: string | null;
  counts: Record<"active" | "backlog" | "done", number>;
};

export type RunnerStatus = "unknown" | "idle" | "running" | "stale" | "blocked" | "waiting_for_human";
export type RunnerTaskRegistrationStatus = "none" | "active" | "inactive" | "missing" | "mismatched";

export type RunnerSummary = {
  schemaVersion?: number | null;
  status: RunnerStatus;
  rawStatus?: string | null;
  sessionId?: string | null;
  owner?: string | null;
  taskId?: string | null;
  phase?: string | null;
  startedAt?: string | null;
  heartbeatAt?: string | null;
  message?: string | null;
  reason?: string | null;
  stale?: boolean;
  staleAfterSeconds?: number;
  taskRegistrationStatus?: RunnerTaskRegistrationStatus;
  taskRegistrationMessage?: string | null;
};

export type UrlFields = {
  localUrl: string | null;
  testUrl: string | null;
  deploymentUrl: string | null;
};

export type ProjectIconSource = {
  kind: "local" | "favicon";
  url: string;
  label: string;
};

export type ProjectSummary = UrlFields & {
  id: string;
  name: string;
  path: string;
  detection: DetectionMode;
  iconSources?: ProjectIconSource[];
  repoUrl: string | null;
  currentBranch: string | null;
  dirtyWorktree: boolean | null;
  activeTask: ActiveTaskSummary | null;
  taskStatus?: ProjectTaskStatus;
  runner?: RunnerSummary;
  gateStatus?: GateStatus;
  errors?: Array<string | { file?: string; message: string }>;
  harnessTemplate?: HarnessTemplateSyncSummary | null;
  legacyHarnessCleanup?: LegacyHarnessCleanupSummary | null;
};

export type HarnessTemplateSyncStatus = "current" | "stale" | "missing" | "unknown";

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

export type HarnessTemplateSyncCheckInput = {
  repoPath: string;
  configuredRoots?: string[];
  templateDir?: string;
};

export type HarnessTemplateFileCheck = {
  path: string;
  sha256: string;
  status: "current" | "stale" | "missing";
  installedSha256: string | null;
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

export type ProjectCandidate = {
  id: string;
  name: string;
  path: string;
  rootPath: string;
  iconSources?: ProjectIconSource[];
  status: "managed" | "not_setup";
  managedProjectId: string | null;
  detection: DetectionMode | null;
  services?: ProjectDevService[];
};

export type ProjectDevService = {
  id: string;
  label: string;
  command: string;
  script: string;
  cwd: string;
};

export type ProjectFilesInput = {
  repoPath: string;
  configuredRoots?: string[];
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

export type TaskArtifacts = {
  statusMarkdown?: string | null;
  specMarkdown?: string | null;
  designMarkdown?: string | null;
  designReviewMarkdown?: string | null;
  contractMarkdown?: string | null;
  implementationMarkdown?: string | null;
  codeReviewMarkdown?: string | null;
  verificationMarkdown?: string | null;
  decisionsMarkdown?: string | null;
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

export type RevisionSet = {
  manifest?: string | null;
  state?: string | null;
  queue?: string | null;
};

export type ProjectDetail = ProjectSummary & {
  queue?: {
    active?: TaskQueueItem[];
    backlog?: TaskQueueItem[];
    done?: TaskQueueItem[];
  };
  currentTask?: TaskArtifacts | null;
  taskArtifacts?: Record<string, TaskArtifacts>;
  recentDecisions?: RecentDecision[];
  gitHistory?: GitEvent[];
  development?: DevelopmentMetadata | null;
  revisions?: RevisionSet;
  parseErrors?: string[];
  syncWarnings?: string[];
  reviewSummary?: string | null;
  evidenceSummary?: string | null;
};

export type ScanResult = {
  projects: ProjectSummary[];
  candidates?: ProjectCandidate[];
  roots?: RootRecord[];
  errors?: string[];
  rootErrors?: RootRecord[];
};

export type UpdateProjectUrlsInput = UrlFields & {
  projectId?: string;
  repoPath?: string;
  configuredRoots?: string[];
  expectedRevision?: string | null;
  urls?: Partial<UrlFields>;
};

export type UpdateProjectUrlsResult = {
  ok?: boolean;
  project?: ProjectDetail;
  revisions?: RevisionSet;
  conflict?: boolean;
  reason?: string;
  message?: string;
  revision?: string;
  latestRevision?: string;
  error?: string;
};

export type CreateHarnessRepoInput = {
  projectName: string;
  targetPath?: string;
  targetDir?: string;
  configuredRoots?: string[];
  repositoryUrl?: string | null;
  defaultBranch?: string | null;
  projectSlug?: string;
  description?: string;
  allowExistingDirectory?: boolean;
};

export type CreateHarnessRepoResult = {
  ok?: boolean;
  projectPath?: string;
  path?: string;
  files?: string[];
  reason?: string;
  message?: string;
  error?: string;
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

export type SharkBayBridge = {
  app?: {
    onOpenSettings?: (callback: () => void) => () => void;
  };
  listRoots?: () => Promise<AppConfig | RootRecord[] | string[]>;
  addRoot?: (input: { path: string; rootPath?: string } | string) => Promise<AppConfig | RootRecord[] | void>;
  removeRoot?: (input: { path: string; rootPath?: string } | string) => Promise<AppConfig | RootRecord[] | void>;
  setAppearanceTheme?: (input: { theme: AppearanceTheme }) => Promise<AppConfig>;
  scanProjects?: () => Promise<ScanResult | ProjectSummary[]>;
  getProjectDetail?: (input: { projectId?: string; repoPath?: string } | string) => Promise<ProjectDetail>;
  listProjectFiles?: (input: ProjectFilesInput) => Promise<ProjectFilesResult>;
  updateProjectUrls?: (input: UpdateProjectUrlsInput) => Promise<UpdateProjectUrlsResult>;
  createHarnessRepo?: (input: CreateHarnessRepoInput) => Promise<CreateHarnessRepoResult>;
  generateNextActionPrompt?: (input: NextActionPromptInput) => Promise<NextActionPromptResult | string>;
  config?: {
    listRoots?: () => Promise<AppConfig | RootRecord[] | string[]>;
    addRoot?: (input: { path: string; rootPath?: string } | string) => Promise<AppConfig | RootRecord[] | void>;
    removeRoot?: (input: { path: string; rootPath?: string } | string) => Promise<AppConfig | RootRecord[] | void>;
    setAppearanceTheme?: (input: { theme: AppearanceTheme }) => Promise<AppConfig>;
  };
  projects?: {
    scan?: () => Promise<ScanResult | ProjectSummary[]>;
    getDetail?: (input: { projectId?: string; repoPath?: string } | string) => Promise<ProjectDetail>;
    listFiles?: (input: ProjectFilesInput) => Promise<ProjectFilesResult>;
    updateUrls?: (input: UpdateProjectUrlsInput) => Promise<UpdateProjectUrlsResult>;
    createHarnessRepo?: (input: CreateHarnessRepoInput) => Promise<CreateHarnessRepoResult>;
  };
  prompts?: {
    nextAction?: (input: NextActionPromptInput) => Promise<NextActionPromptResult | string>;
  };
  harness?: {
    checkTemplateSync?: (input: HarnessTemplateSyncCheckInput) => Promise<HarnessTemplateSyncCheckResult>;
    updateTemplateFiles?: (input: HarnessTemplateSyncUpdateInput) => Promise<HarnessTemplateSyncUpdateResult>;
    migrateLegacyHarness?: (input: LegacyHarnessCleanupCheckInput) => Promise<LegacyHarnessCleanupMigrationResult>;
    uninstall?: (input: HarnessUninstallInput) => Promise<HarnessUninstallResult>;
  };
  terminal?: {
    create?: (input: TerminalCreateInput) => Promise<TerminalSession>;
    input?: (input: TerminalInput) => Promise<TerminalSession>;
    resize?: (input: TerminalResizeInput) => Promise<TerminalSession>;
    close?: (input: TerminalCloseInput) => Promise<TerminalSession>;
    onData?: (callback: (event: TerminalDataEvent) => void) => () => void;
    onExit?: (callback: (event: TerminalExitEvent) => void) => () => void;
    onUpdate?: (callback: (event: TerminalUpdateEvent) => void) => () => void;
  };
};
