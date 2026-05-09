import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import type { CSSProperties, FormEvent, KeyboardEvent, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { Terminal as XTerm } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import defaultProjectIconUrl from "./assets/shark-fin.png";
import type {
  AppConfig,
  AppearanceTheme,
  CreateHarnessRepoInput,
  CreateHarnessRepoResult,
  HarnessTemplateSyncUpdateResult,
  HarnessUninstallResult,
  ProjectCandidate,
  ProjectDetail,
  ProjectFileTreeItem,
  ProjectSummary,
  RootRecord,
  ScanResult,
  SharkBayBridge,
  TaskArtifacts,
  TerminalDataEvent,
  TerminalExitEvent,
  TerminalCreateInput,
  TerminalSession,
  TerminalUpdateEvent,
  TaskQueueItem,
} from "./types";
import {
  preferredInitialCandidate,
  projectSummaryFromDetail,
  projectToCandidate,
  resolveSelectedCandidate,
  shouldResetTerminalObservationForInput,
  terminalActivityForCandidate,
  validTerminalResizeDimensions,
} from "./workflow";
import type { WorkflowProjectTerminalActivityState } from "./workflow";

type View = "dashboard" | "settings";
type DetailMode = "overview" | "task";
type DetailTab = "tasks" | "decisions" | "git" | "info" | "files";
type SettingsSection = "project-roots" | "project-status";

type Toast = {
  tone: "info" | "error" | "success";
  message: string;
};

type ArtifactKey = keyof TaskArtifacts;

type SaveState = "idle" | "saving" | "saved" | "conflict" | "error";

type RefreshOptions = {
  showToast?: boolean;
  setBusy?: boolean;
};

type CandidateGroup = "managed" | "not_setup";

type Disposable = {
  dispose: () => void;
};

type TerminalActivityState = "idle" | "working" | "done";
type ProjectTerminalActivityState = WorkflowProjectTerminalActivityState;

type TerminalTab = {
  session: TerminalSession;
  terminal: XTerm;
  fitAddon: FitAddon;
  disposables: Disposable[];
  activityState: TerminalActivityState;
  outputBurstStartedAt: number | null;
};

type TerminalSpace = {
  projectId: string;
  projectName: string;
  path: string;
  tabs: TerminalTab[];
  activeId: string | null;
};

type TerminalPaneHandle = {
  openFileInEditor: (projectPath: string, projectName: string, relativePath: string) => Promise<void>;
  openGitDiff: (projectPath: string, projectName: string, relativePath: string) => Promise<void>;
};

const minProjectColumnWidth = 216;
const minDetailColumnWidth = 340;
const minTerminalColumnWidth = 420;
const terminalWorkingThresholdMs = 5000;
const terminalQuietDoneMs = 5000;
const defaultProjectColumnWidth = minProjectColumnWidth;
const defaultDetailColumnWidth = minDetailColumnWidth;
const resizerColumnWidth = 12;
const columnResizeStep = 40;
const detailColumnStorageKey = "sharkbay.detailColumnWidth.v2";
const projectColumnStorageKey = "sharkbay.projectColumnWidth.v2";
const detailTabs: Array<{ id: DetailTab; label: string }> = [
  { id: "tasks", label: "Tasks" },
  { id: "decisions", label: "Decisions" },
  { id: "git", label: "Git" },
  { id: "info", label: "Info" },
  { id: "files", label: "Files" },
];
const settingsSections: Array<{ id: SettingsSection; label: string }> = [
  { id: "project-roots", label: "Project roots" },
  { id: "project-status", label: "Status" },
];

const appearanceThemes: Array<{ id: AppearanceTheme; label: string }> = [
  { id: "morning", label: "Morning" },
  { id: "day", label: "Day" },
  { id: "night", label: "Night" },
];

const terminalThemes: Record<AppearanceTheme, NonNullable<ConstructorParameters<typeof XTerm>[0]>["theme"]> = {
  day: {
    background: "#f7f1e4",
    foreground: "#263235",
    cursor: "#2d5860",
    selectionBackground: "#d8cab1",
    black: "#1f2528",
    blue: "#2d6474",
    cyan: "#367f86",
    green: "#4c845d",
    magenta: "#7a677f",
    red: "#b85f51",
    white: "#fffdfa",
    yellow: "#9a6b16",
  },
  night: {
    background: "#101719",
    foreground: "#d9e5df",
    cursor: "#93d7a4",
    selectionBackground: "#38575d",
    black: "#0d1213",
    blue: "#82b7c4",
    cyan: "#8eced2",
    green: "#93d7a4",
    magenta: "#c6a7d8",
    red: "#e58b7e",
    white: "#edf2ef",
    yellow: "#d7bd78",
  },
  morning: {
    background: "#101719",
    foreground: "#d9e5df",
    cursor: "#93d7a4",
    selectionBackground: "#38575d",
    black: "#000000",
    red: "#cd3131",
    green: "#0dbc79",
    yellow: "#e5e510",
    blue: "#2472c8",
    magenta: "#bc3fbc",
    cyan: "#11a8cd",
    white: "#e5e5e5",
    brightBlack: "#666666",
    brightRed: "#f14c4c",
    brightGreen: "#23d18b",
    brightYellow: "#f5f543",
    brightBlue: "#3b8eea",
    brightMagenta: "#d670d6",
    brightCyan: "#29b8db",
    brightWhite: "#e5e5e5",
  },
};

const artifactOrder: ArtifactKey[] = [
  "statusMarkdown",
  "contractMarkdown",
  "implementationMarkdown",
  "verificationMarkdown",
  "codeReviewMarkdown",
  "designMarkdown",
  "designReviewMarkdown",
  "specMarkdown",
  "decisionsMarkdown",
];

const taskIdCollator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

function getBridge(): SharkBayBridge {
  if (typeof window === "undefined" || !window.sharkBay) {
    throw new Error("The SharkBay preload API is not available.");
  }

  return window.sharkBay;
}

function asMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function suppressToast(_toast: Toast): void {
  // Global top-of-app toasts are intentionally disabled.
}

function isAppConfig(value: unknown): value is AppConfig {
  return Boolean(value && typeof value === "object" && "configuredRoots" in value);
}

function normalizeAppearanceTheme(value: unknown): AppearanceTheme {
  if (value === "morning" || value === "classic") return "morning";
  return value === "night" ? "night" : "day";
}

function normalizeRoots(raw: AppConfig | RootRecord[] | string[] | undefined): RootRecord[] {
  if (!raw) {
    return [];
  }

  if (isAppConfig(raw)) {
    return raw.configuredRoots.map((root) => ({ path: root }));
  }

  return raw.map((root) => {
    if (typeof root === "string") {
      return { path: root };
    }

    return {
      ...root,
      path: root.path || root.inputPath || "",
      unavailable: root.unavailable ?? root.available === false,
    };
  });
}

function normalizeScan(raw: ScanResult | ProjectSummary[]): ScanResult {
  if (Array.isArray(raw)) {
    return { projects: raw, candidates: raw.map(projectToCandidate) };
  }

  return {
    ...raw,
    candidates: raw.candidates ?? raw.projects.map(projectToCandidate),
  };
}

async function listRoots(): Promise<RootRecord[]> {
  const bridge = getBridge();
  const handler = bridge.config?.listRoots ?? bridge.listRoots;

  if (!handler) {
    throw new Error("Root listing is not exposed by the preload API.");
  }

  return normalizeRoots(await handler());
}

async function updateAppearanceTheme(theme: AppearanceTheme): Promise<AppConfig> {
  const bridge = getBridge();
  const handler = bridge.config?.setAppearanceTheme ?? bridge.setAppearanceTheme;

  if (!handler) {
    throw new Error("Appearance theme settings are not exposed by the preload API.");
  }

  return handler({ theme });
}

async function addRoot(path: string): Promise<void> {
  const bridge = getBridge();
  const handler = bridge.config?.addRoot ?? bridge.addRoot;

  if (!handler) {
    throw new Error("Root add is not exposed by the preload API.");
  }

  await handler({ path, rootPath: path });
}

async function removeRoot(path: string): Promise<void> {
  const bridge = getBridge();
  const handler = bridge.config?.removeRoot ?? bridge.removeRoot;

  if (!handler) {
    throw new Error("Root remove is not exposed by the preload API.");
  }

  await handler({ path, rootPath: path });
}

async function scanProjects(): Promise<ScanResult> {
  const bridge = getBridge();
  const handler = bridge.projects?.scan ?? bridge.scanProjects;

  if (!handler) {
    throw new Error("Project scanning is not exposed by the preload API.");
  }

  return normalizeScan(await handler());
}

async function getProjectDetail(project: ProjectSummary): Promise<ProjectDetail> {
  const bridge = getBridge();
  const handler = bridge.projects?.getDetail ?? bridge.getProjectDetail;

  if (!handler) {
    throw new Error("Project detail is not exposed by the preload API.");
  }

  return handler({ projectId: project.id, repoPath: project.path });
}

async function createHarnessRepo(input: CreateHarnessRepoInput): Promise<CreateHarnessRepoResult> {
  const bridge = getBridge();
  const handler = bridge.projects?.createHarnessRepo ?? bridge.createHarnessRepo;

  if (!handler) {
    throw new Error("Repo creation is not exposed by the preload API.");
  }

  const targetDir = input.targetDir ?? input.targetPath ?? "";

  return handler({
    ...input,
    targetDir,
    targetPath: targetDir,
  });
}

async function updateHarnessTemplateFiles(project: ProjectSummary | ProjectDetail): Promise<HarnessTemplateSyncUpdateResult> {
  const handler = getBridge().harness?.updateTemplateFiles;
  if (!handler) {
    throw new Error("Harness template sync is not exposed by the preload API.");
  }
  return handler({ repoPath: project.path });
}

async function migrateLegacyHarness(project: ProjectSummary | ProjectDetail) {
  const handler = getBridge().harness?.migrateLegacyHarness;
  if (!handler) {
    throw new Error("Legacy harness migration is not exposed by the preload API.");
  }
  return handler({ repoPath: project.path });
}

async function uninstallHarness(project: ProjectSummary): Promise<HarnessUninstallResult> {
  const handler = getBridge().harness?.uninstall;
  if (!handler) {
    throw new Error("Harness uninstall is not exposed by the preload API.");
  }
  return handler({ repoPath: project.path });
}

async function listProjectFiles(project: ProjectSummary | ProjectDetail, directoryPath?: string) {
  const handler = getBridge().projects?.listFiles ?? getBridge().listProjectFiles;
  if (!handler) {
    throw new Error("Project files are not exposed by the preload API.");
  }
  return handler({ repoPath: project.path, directoryPath });
}

async function createTerminal(
  cwd: string,
  title?: string,
  options: Pick<TerminalCreateInput, "initialCommand" | "service"> = {},
): Promise<TerminalSession> {
  const handler = getBridge().terminal?.create;
  if (!handler) {
    throw new Error("Terminal sessions are not exposed by the preload API.");
  }
  return handler({ cwd, title, ...options });
}

async function sendTerminalInput(sessionId: string, data: string): Promise<void> {
  const handler = getBridge().terminal?.input;
  if (!handler) {
    throw new Error("Terminal input is not exposed by the preload API.");
  }
  await handler({ sessionId, data });
}

async function resizeTerminal(sessionId: string, cols: number, rows: number): Promise<void> {
  if (!validTerminalResizeDimensions(cols, rows)) {
    return;
  }
  const handler = getBridge().terminal?.resize;
  if (!handler) {
    throw new Error("Terminal resize is not exposed by the preload API.");
  }
  await handler({ sessionId, cols: Math.floor(cols), rows: Math.floor(rows) });
}

async function closeTerminal(sessionId: string): Promise<void> {
  const handler = getBridge().terminal?.close;
  if (!handler) {
    throw new Error("Terminal close is not exposed by the preload API.");
  }
  await handler({ sessionId });
}

function editorCommandFor(relativePath: string): string {
  const quotedPath = shellQuote(relativePath);
  return `if command -v vim >/dev/null 2>&1; then vim -- ${quotedPath}; else nano -- ${quotedPath}; fi`;
}

function gitDiffCommandFor(relativePath: string): string {
  const quotedPath = shellQuote(relativePath);
  return [
    `git --no-pager diff -- ${quotedPath}`,
    `git --no-pager diff --cached -- ${quotedPath}`,
    `if git ls-files --others --exclude-standard -- ${quotedPath} | grep -Fqx -- ${quotedPath}; then git --no-pager diff --no-index -- /dev/null ${quotedPath} || true; fi`,
  ].join("; ");
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, "'\\''")}'`;
}

function isEmptyValue(value: string | null | undefined): boolean {
  const normalized = value?.trim().toLowerCase();
  return !normalized || ["none", "null", "unknown", "unset"].includes(normalized);
}

function hasMeaningfulActiveTask(task: ProjectDetail["activeTask"] | undefined): task is NonNullable<ProjectDetail["activeTask"]> {
  return Boolean(task && !isEmptyValue(task.taskId));
}

function activeTaskTitle(project: ProjectSummary | ProjectDetail | null): string | null {
  const task = project?.activeTask;
  if (!hasMeaningfulActiveTask(task)) {
    return null;
  }

  return !isEmptyValue(task.title) ? task.title ?? null : task.taskId;
}

function compareQueueItems(a: TaskQueueItem, b: TaskQueueItem): number {
  const aNumber = taskSequenceNumber(a.taskId);
  const bNumber = taskSequenceNumber(b.taskId);
  if (aNumber !== bNumber) {
    return bNumber - aNumber;
  }
  return taskIdCollator.compare(a.taskId, b.taskId);
}

function taskSequenceNumber(taskId: string): number {
  const match = taskId.match(/t-(\d+)/i);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

function phaseClass(value: string | null | undefined): string {
  return `phase-${(value || "unknown").toLowerCase().replace(/[^a-z0-9_-]/gi, "_")}`;
}

function cx(...names: Array<string | false | null | undefined>): string {
  return names.filter(Boolean).join(" ");
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function storedColumnWidth(key: string, fallback: number, min: number): number {
  if (typeof window === "undefined") {
    return fallback;
  }

  const saved = Number(window.localStorage.getItem(key));
  return Number.isFinite(saved) && saved >= min ? saved : fallback;
}

function formatScanTime(value: string | null): string {
  if (!value) {
    return "never";
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

function formatHistoryTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const hasClock = /T|\d{1,2}:\d{2}/.test(value);
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...(hasClock ? { hour: "2-digit" as const, minute: "2-digit" as const } : {}),
  }).format(parsed);
}

function formatRelativeTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return formatHistoryTime(value);
  }

  const diffSeconds = Math.round((parsed.getTime() - Date.now()) / 1000);
  const absSeconds = Math.abs(diffSeconds);
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
  ];
  const [unit, secondsPerUnit] = units.find(([, seconds]) => absSeconds >= seconds) ?? ["second", 1];
  const valueInUnits = Math.round(diffSeconds / secondsPerUnit);
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(valueInUnits, unit);
}

function appearanceDescription(theme: AppearanceTheme): string {
  if (theme === "morning") return "Morning icon and original dark terminal";
  if (theme === "night") return "Night icon and dark colors";
  return "Day icon and colors";
}

export function App() {
  const [view, setView] = useState<View>("dashboard");
  const [roots, setRoots] = useState<RootRecord[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [candidates, setCandidates] = useState<ProjectCandidate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const setToast = suppressToast;
  const [scanErrors, setScanErrors] = useState<string[]>([]);
  const [lastScanAt, setLastScanAt] = useState<string | null>(null);
  const [appearanceTheme, setAppearanceTheme] = useState<AppearanceTheme>("day");
  const refreshInFlight = useRef(false);

  const bridgeAvailable = typeof window !== "undefined" && Boolean(window.sharkBay);

  const projectById = useMemo(() => new Map(projects.map((project) => [project.id, project])), [projects]);

  const selectedCandidate = useMemo(() => resolveSelectedCandidate(candidates, projectById, selectedId), [candidates, projectById, selectedId]);

  const selectedProject = useMemo(() => {
    if (selectedCandidate?.managedProjectId) {
      return projectById.get(selectedCandidate.managedProjectId) ?? null;
    }

    return selectedId ? projectById.get(selectedId) ?? null : null;
  }, [projectById, selectedCandidate, selectedId]);

  async function refreshRoots() {
    setRoots(await listRoots());
  }

  async function refreshProjects(options: RefreshOptions = {}): Promise<{ projects: ProjectSummary[]; candidates: ProjectCandidate[] }> {
    const showToast = options.showToast ?? false;
    const setBusy = options.setBusy ?? true;

    if (setBusy) {
      setLoading(true);
    }
    setScanErrors([]);

    try {
      const bridge = getBridge();
      const configHandler = bridge.config?.listRoots ?? bridge.listRoots;
      if (!configHandler) {
        throw new Error("Root listing is not exposed by the preload API.");
      }
      const [rootConfig, scan] = await Promise.all([configHandler(), scanProjects()]);
      const rootList = normalizeRoots(rootConfig);
      if (isAppConfig(rootConfig)) {
        setAppearanceTheme(normalizeAppearanceTheme(rootConfig.appearanceTheme));
      }
      const nextProjects = scan.projects ?? [];
      const nextCandidates = scan.candidates ?? nextProjects.map(projectToCandidate);
      const normalizedRootErrors = normalizeRoots(scan.rootErrors);
      const rootErrors = [
        ...(scan.errors ?? []),
        ...normalizedRootErrors.map((root) => `${root.path}: ${root.error ?? "unavailable"}`),
      ];
      const nextRoots = scan.roots
        ? normalizeRoots(scan.roots)
        : rootList.map((root) => {
            const rootError = normalizedRootErrors.find((errorRoot) => errorRoot.path === root.path || errorRoot.inputPath === root.path);
            return rootError ? { ...root, unavailable: true, error: rootError.error ?? "unavailable" } : root;
          });

      setRoots(nextRoots);
      setProjects(nextProjects);
      setCandidates(nextCandidates);
      setScanErrors(rootErrors);
      setLastScanAt(new Date().toISOString());
      setSelectedId((current) => {
        if (current && (nextCandidates.some((candidate) => candidate.id === current) || nextProjects.some((project) => project.id === current))) {
          return current;
        }

        return preferredInitialCandidate(nextCandidates)?.id ?? null;
      });
      return { projects: nextProjects, candidates: nextCandidates };
    } catch (error) {
      if (showToast || setBusy) {
        setToast({ tone: "error", message: asMessage(error) });
      }
      return { projects, candidates };
    } finally {
      if (setBusy) {
        setLoading(false);
      }
    }
  }

  async function refreshDetail(project = selectedProject, options: RefreshOptions = {}) {
    const showToast = options.showToast ?? false;
    const setBusy = options.setBusy ?? true;

    if (!project) {
      setDetail(null);
      return;
    }

    if (setBusy) {
      setDetailLoading(true);
    }

    try {
      const nextDetail = await getProjectDetail(project);
      setDetail(nextDetail);
      setProjects((currentProjects) =>
        currentProjects.map((currentProject) =>
          currentProject.id === nextDetail.id ? projectSummaryFromDetail(nextDetail) : currentProject,
        ),
      );
    } catch (error) {
      if (showToast || setBusy) {
        setToast({ tone: "error", message: asMessage(error) });
      }
      setDetail({ ...project, parseErrors: [asMessage(error)] });
    } finally {
      if (setBusy) {
        setDetailLoading(false);
      }
    }
  }

  async function refreshWorkspace(options: RefreshOptions = { showToast: true }) {
    if (refreshInFlight.current) {
      return;
    }

    refreshInFlight.current = true;
    try {
      const refreshed = await refreshProjects(options);
      if (selectedProject && refreshed.projects.some((project) => project.id === selectedProject.id)) {
        await refreshDetail(selectedProject, options);
      } else if (selectedProject) {
        setDetail(null);
      }
    } finally {
      refreshInFlight.current = false;
    }
  }

  useEffect(() => {
    if (!bridgeAvailable) {
      setToast({ tone: "error", message: "Waiting for window.sharkBay from the preload bridge." });
      return;
    }

    void refreshProjects();
  }, [bridgeAvailable]);

  useEffect(() => {
    if (!bridgeAvailable) {
      return;
    }

    const unsubscribe = getBridge().app?.onOpenSettings?.(() => setView("settings"));
    return () => unsubscribe?.();
  }, [bridgeAvailable]);

  useEffect(() => {
    if (!bridgeAvailable) {
      return;
    }

    const timer = window.setInterval(() => {
      void refreshWorkspace({ showToast: false, setBusy: false });
    }, 5000);

    return () => window.clearInterval(timer);
  }, [bridgeAvailable, selectedProject?.id]);

  useEffect(() => {
    setDetail(null);
    void refreshDetail();
  }, [selectedProject?.id]);

  return (
    <div className="app-shell" data-theme={appearanceTheme}>
      <main className="workspace">
        <div className="workspace-body">
          <div
            aria-hidden={view !== "dashboard"}
            className={cx("view-surface", view !== "dashboard" && "is-hidden")}
          >
            <DashboardView
              appearanceTheme={appearanceTheme}
              bridgeAvailable={bridgeAvailable}
              configuredRoots={roots.map((root) => root.path)}
              detail={detail}
              filteredCandidates={candidates}
              isVisible={view === "dashboard"}
              loading={loading}
              projectById={projectById}
              scanErrors={scanErrors}
              selectedCandidate={selectedCandidate}
              selectedProject={selectedProject}
              setSelectedId={setSelectedId}
              setToast={setToast}
              onRefresh={refreshWorkspace}
            />
          </div>

          {view === "settings" ? (
            <div className="view-surface settings-surface">
              <SettingsView
                appearanceTheme={appearanceTheme}
                roots={roots}
                bridgeAvailable={bridgeAvailable}
                lastScanAt={lastScanAt}
                loading={loading}
                projects={projects}
                scanErrors={scanErrors}
                setToast={setToast}
                onBack={() => setView("dashboard")}
                onScan={async () => {
                  await refreshProjects({ showToast: true });
                }}
                onAdd={async (path) => {
                  await addRoot(path);
                  await refreshRoots();
                  await refreshProjects({ showToast: true });
                }}
                onRemove={async (path) => {
                  await removeRoot(path);
                  await refreshRoots();
                  await refreshProjects({ showToast: true });
                }}
                onThemeChange={async (theme) => {
                  const config = await updateAppearanceTheme(theme);
                  setAppearanceTheme(normalizeAppearanceTheme(config.appearanceTheme));
                }}
              />
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function DashboardView({
  appearanceTheme,
  bridgeAvailable,
  configuredRoots,
  detail,
  filteredCandidates,
  isVisible,
  loading,
  projectById,
  scanErrors,
  selectedCandidate,
  selectedProject,
  setSelectedId,
  setToast,
  onRefresh,
}: {
  appearanceTheme: AppearanceTheme;
  bridgeAvailable: boolean;
  configuredRoots: string[];
  detail: ProjectDetail | null;
  filteredCandidates: ProjectCandidate[];
  isVisible: boolean;
  loading: boolean;
  projectById: Map<string, ProjectSummary>;
  scanErrors: string[];
  selectedCandidate: ProjectCandidate | null;
  selectedProject: ProjectSummary | null;
  setSelectedId: (value: string) => void;
  setToast: (toast: Toast) => void;
  onRefresh: () => Promise<void>;
}) {
  const managedCandidates = filteredCandidates.filter((candidate) => candidate.status === "managed");
  const notSetupCandidates = filteredCandidates.filter((candidate) => candidate.status === "not_setup");
  const gridRef = useRef<HTMLDivElement | null>(null);
  const terminalPaneRef = useRef<TerminalPaneHandle | null>(null);
  const [runningServiceProjectIds, setRunningServiceProjectIds] = useState<Set<string>>(() => new Set());
  const [terminalActivityByProjectId, setTerminalActivityByProjectId] = useState<Record<string, ProjectTerminalActivityState>>({});
  const [projectColumnWidth, setProjectColumnWidth] = useState(() =>
    storedColumnWidth(projectColumnStorageKey, defaultProjectColumnWidth, minProjectColumnWidth),
  );
  const [detailColumnWidth, setDetailColumnWidth] = useState(() =>
    storedColumnWidth(detailColumnStorageKey, defaultDetailColumnWidth, minDetailColumnWidth),
  );
  const [projectMenu, setProjectMenu] = useState<{
    project: ProjectSummary;
    x: number;
    y: number;
  } | null>(null);

  function normalizeColumnWidths(projectWidth: number, detailWidth: number, gridWidth: number) {
    const availableWidth = gridWidth - resizerColumnWidth * 2;
    const minimumWidth = minProjectColumnWidth + minDetailColumnWidth + minTerminalColumnWidth;

    if (availableWidth <= minimumWidth) {
      return {
        projectWidth: minProjectColumnWidth,
        detailWidth: minDetailColumnWidth,
      };
    }

    const nextProjectWidth = clamp(projectWidth, minProjectColumnWidth, availableWidth - minDetailColumnWidth - minTerminalColumnWidth);
    const nextDetailWidth = clamp(detailWidth, minDetailColumnWidth, availableWidth - nextProjectWidth - minTerminalColumnWidth);

    return {
      projectWidth: Math.round(nextProjectWidth),
      detailWidth: Math.round(nextDetailWidth),
    };
  }

  function persistColumnWidths(projectWidth: number, detailWidth: number, gridWidth = gridRef.current?.getBoundingClientRect().width) {
    const next = gridWidth
      ? normalizeColumnWidths(projectWidth, detailWidth, gridWidth)
      : {
          projectWidth: Math.max(minProjectColumnWidth, Math.round(projectWidth)),
          detailWidth: Math.max(minDetailColumnWidth, Math.round(detailWidth)),
        };

    setProjectColumnWidth(next.projectWidth);
    setDetailColumnWidth(next.detailWidth);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(projectColumnStorageKey, String(next.projectWidth));
      window.localStorage.setItem(detailColumnStorageKey, String(next.detailWidth));
    }
  }

  function resizeProjectColumn(grid: HTMLElement, clientX: number) {
    const rect = grid.getBoundingClientRect();
    persistColumnWidths(clientX - rect.left, detailColumnWidth, rect.width);
  }

  function resizeDetailColumn(grid: HTMLElement, clientX: number) {
    const rect = grid.getBoundingClientRect();
    persistColumnWidths(projectColumnWidth, rect.right - clientX, rect.width);
  }

  function startColumnResize(target: "project" | "detail", event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    const grid = event.currentTarget.parentElement;
    if (!grid) {
      return;
    }

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (target === "project") {
        resizeProjectColumn(grid, moveEvent.clientX);
      } else {
        resizeDetailColumn(grid, moveEvent.clientX);
      }
    };
    const onPointerUp = () => {
      document.body.classList.remove("is-resizing-columns");
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    document.body.classList.add("is-resizing-columns");
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp, { once: true });
  }

  function resizeWithKeyboard(target: "project" | "detail", event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? columnResizeStep : -columnResizeStep;
    if (target === "project") {
      persistColumnWidths(projectColumnWidth + delta, detailColumnWidth);
    } else {
      const detailDelta = event.key === "ArrowLeft" ? columnResizeStep : -columnResizeStep;
      persistColumnWidths(projectColumnWidth, detailColumnWidth + detailDelta);
    }
  }

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) {
        persistColumnWidths(projectColumnWidth, detailColumnWidth, width);
      }
    });
    observer.observe(grid);
    return () => observer.disconnect();
  }, [detailColumnWidth, projectColumnWidth]);

  useEffect(() => {
    if (!projectMenu) {
      return;
    }
    const close = () => setProjectMenu(null);
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setProjectMenu(null);
      }
    };
    window.addEventListener("click", close);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [projectMenu]);

  async function handleUninstallHarness(project: ProjectSummary) {
    setProjectMenu(null);
    const confirmed = window.confirm(`Uninstall the Ripple harness from ${project.name}?\n\nThis removes harness files and only matching .gitignore lines from the project workspace.`);
    if (!confirmed) {
      return;
    }

    try {
      const result = await uninstallHarness(project);
      if (!result.ok) {
        const blockers = result.blockers?.length ? ` ${result.blockers.join(" ")}` : "";
        throw new Error(`${result.message}${blockers}`);
      }
      setToast({ tone: "success", message: `Harness uninstalled from ${project.name}.` });
      await onRefresh();
    } catch (error) {
      setToast({ tone: "error", message: asMessage(error) });
    }
  }

  const gridStyle = {
    gridTemplateColumns: `${projectColumnWidth}px ${resizerColumnWidth}px minmax(${minTerminalColumnWidth}px, 1fr) ${resizerColumnWidth}px ${detailColumnWidth}px`,
  } satisfies CSSProperties;

  return (
    <div className="dashboard-grid" ref={gridRef} style={gridStyle}>
      <section className="project-panel">
        <div className="project-window-drag-strip" aria-hidden="true" />
        {scanErrors.length ? (
          <div className="inline-errors">
            {scanErrors.map((error) => (
              <div key={error}>{error}</div>
            ))}
          </div>
        ) : null}

        <div className="project-sections">
          <ProjectTable
            candidates={managedCandidates}
            group="managed"
            projectById={projectById}
            runningServiceProjectIds={runningServiceProjectIds}
            terminalActivityByProjectId={terminalActivityByProjectId}
            selectedId={selectedCandidate?.id ?? null}
            title="Managed"
            onSelect={setSelectedId}
            onContextMenu={(project, event) => {
              event.preventDefault();
              setProjectMenu({ project, x: event.clientX, y: event.clientY });
            }}
          />
          <ProjectTable
            candidates={notSetupCandidates}
            group="not_setup"
            projectById={projectById}
            runningServiceProjectIds={runningServiceProjectIds}
            terminalActivityByProjectId={terminalActivityByProjectId}
            selectedId={selectedCandidate?.id ?? null}
            title="Not setup"
            onSelect={setSelectedId}
          />
        </div>
        {projectMenu ? (
          <div
            className="project-context-menu"
            role="menu"
            style={{ left: projectMenu.x, top: projectMenu.y }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              autoFocus
              className="project-context-menu-item is-danger"
              role="menuitem"
              type="button"
              onClick={() => void handleUninstallHarness(projectMenu.project)}
            >
              Uninstall Harness
            </button>
          </div>
        ) : null}
      </section>

      <div
        aria-label="Resize project column"
        aria-orientation="vertical"
        className="column-resizer"
        role="separator"
        tabIndex={0}
        onKeyDown={(event) => resizeWithKeyboard("project", event)}
        onPointerDown={(event) => startColumnResize("project", event)}
      />

      <section className="panel terminal-panel">
        <TerminalPane
          ref={terminalPaneRef}
          appearanceTheme={appearanceTheme}
          candidate={selectedCandidate}
          bridgeAvailable={bridgeAvailable}
          isVisible={isVisible}
          setToast={setToast}
          onRunningServiceProjectIdsChange={(nextIds) =>
            setRunningServiceProjectIds((currentIds) =>
              sameStringSet(currentIds, nextIds) ? currentIds : nextIds,
            )
          }
          onTerminalActivityProjectStatesChange={(nextStates) =>
            setTerminalActivityByProjectId((currentStates) =>
              sameProjectTerminalActivityStates(currentStates, nextStates) ? currentStates : nextStates,
            )
          }
        />
      </section>

      <div
        aria-label="Resize terminal and detail columns"
        aria-orientation="vertical"
        className="column-resizer"
        role="separator"
        tabIndex={0}
        onKeyDown={(event) => resizeWithKeyboard("detail", event)}
        onPointerDown={(event) => startColumnResize("detail", event)}
      />

      <section className="detail-panel">
        {selectedProject ? (
          <ProjectDetailPane
            detail={detail}
            project={selectedProject}
            setToast={setToast}
            onRefresh={onRefresh}
            onOpenFileInEditor={(relativePath) =>
              terminalPaneRef.current?.openFileInEditor(selectedProject.path, selectedProject.name, relativePath) ?? Promise.resolve()
            }
            onOpenGitDiff={(relativePath) =>
              terminalPaneRef.current?.openGitDiff(selectedProject.path, selectedProject.name, relativePath) ?? Promise.resolve()
            }
          />
        ) : selectedCandidate ? (
          <NotSetupPane
            bridgeAvailable={bridgeAvailable}
            candidate={selectedCandidate}
            configuredRoots={configuredRoots}
            loading={loading}
            setToast={setToast}
            onRefresh={onRefresh}
            onSelect={setSelectedId}
          />
        ) : (
          <EmptyState title="No project selected" body="Open Settings to add a scan root, then scan for projects." />
        )}
      </section>
    </div>
  );
}

const TerminalPane = forwardRef<TerminalPaneHandle, {
  appearanceTheme: AppearanceTheme;
  bridgeAvailable: boolean;
  candidate: ProjectCandidate | null;
  isVisible: boolean;
  setToast: (toast: Toast) => void;
  onRunningServiceProjectIdsChange: (projectIds: Set<string>) => void;
  onTerminalActivityProjectStatesChange: (states: Record<string, ProjectTerminalActivityState>) => void;
}>(function TerminalPane({
  appearanceTheme,
  bridgeAvailable,
  candidate,
  isVisible,
  setToast,
  onRunningServiceProjectIdsChange,
  onTerminalActivityProjectStatesChange,
}, ref) {
  const [spaces, setSpaces] = useState<Record<string, TerminalSpace>>({});
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const spacesRef = useRef<Record<string, TerminalSpace>>({});
  const activeProjectIdRef = useRef<string | null>(null);
  const creatingProjects = useRef(new Set<string>());
  const quietTimers = useRef(new Map<string, ReturnType<typeof window.setTimeout>>());
  const selectedSpace = candidate?.id ? spaces[candidate.id] ?? null : null;
  const canCreate = bridgeAvailable && Boolean(candidate?.path);
  const services = candidate?.services ?? [];

  useEffect(() => {
    spacesRef.current = spaces;
  }, [spaces]);

  useEffect(() => {
    activeProjectIdRef.current = activeProjectId;
  }, [activeProjectId]);

  useEffect(() => () => {
    for (const timer of quietTimers.current.values()) {
      window.clearTimeout(timer);
    }
    quietTimers.current.clear();
  }, []);

  useEffect(() => {
    const runningProjectIds = new Set(
      Object.values(spaces)
        .filter((space) => space.tabs.some((tab) => tab.session.service && tab.session.status === "running"))
        .map((space) => space.projectId),
    );
    onRunningServiceProjectIdsChange(runningProjectIds);
  }, [onRunningServiceProjectIdsChange, spaces]);

  useEffect(() => {
    const nextStates: Record<string, ProjectTerminalActivityState> = {};
    for (const space of Object.values(spaces)) {
      if (space.tabs.some((tab) => tab.activityState === "working")) {
        nextStates[space.projectId] = "working";
      } else if (space.tabs.some((tab) => tab.activityState === "done")) {
        nextStates[space.projectId] = "idle";
      }
    }
    onTerminalActivityProjectStatesChange(nextStates);
  }, [onTerminalActivityProjectStatesChange, spaces]);

  useEffect(() => {
    for (const space of Object.values(spacesRef.current)) {
      for (const tab of space.tabs) {
        tab.terminal.options.theme = terminalThemes[appearanceTheme];
      }
    }
  }, [appearanceTheme]);

  useEffect(() => {
    if (!bridgeAvailable) {
      return;
    }
    const terminal = getBridge().terminal;
    if (!terminal?.onData || !terminal.onExit) {
      return;
    }

    const offData = terminal.onData((event) => appendTerminalOutput(event));
    const offExit = terminal.onExit((event) => markTerminalExit(event));
    const offUpdate = terminal.onUpdate ? terminal.onUpdate((event) => updateTerminalSession(event)) : () => undefined;
    return () => {
      offData();
      offExit();
      offUpdate();
    };
  }, [bridgeAvailable]);

  useEffect(() => {
    if (!candidate?.path || !bridgeAvailable) {
      if (!candidate) {
        setActiveProjectId(null);
      }
      return;
    }

    setActiveProjectId(candidate.id);
    setSpaces((current) => {
      if (current[candidate.id]) {
        return current;
      }
      return {
        ...current,
        [candidate.id]: {
          projectId: candidate.id,
          projectName: candidate.name,
          path: candidate.path,
          tabs: [],
          activeId: null,
        },
      };
    });

    if (!isVisible) {
      return;
    }

    const existing = spacesRef.current[candidate.id];
    if (existing?.tabs.length) {
      return;
    }
    if (creatingProjects.current.has(candidate.id)) {
      return;
    }

    creatingProjects.current.add(candidate.id);
    void openProjectTab(candidate.id, candidate.path, candidate.name, true).finally(() => {
      creatingProjects.current.delete(candidate.id);
    });
  }, [bridgeAvailable, candidate?.id, candidate?.path, isVisible]);

  async function openCurrentProjectTab() {
    if (!candidate?.path) {
      return;
    }
    await openProjectTab(candidate.id, candidate.path, candidate.name);
  }

  useImperativeHandle(ref, () => ({
    openFileInEditor: async (projectPath: string, projectName: string, relativePath: string) => {
      await openProjectTab(projectPath, projectPath, projectName, false, {
        initialCommand: editorCommandFor(relativePath),
      });
    },
    openGitDiff: async (projectPath: string, projectName: string, relativePath: string) => {
      await openProjectTab(projectPath, projectPath, projectName, false, {
        initialCommand: gitDiffCommandFor(relativePath),
      });
    },
  }));

  async function openProjectTab(
    projectId: string,
    cwd: string,
    projectName: string,
    quiet = false,
    options: Pick<TerminalCreateInput, "initialCommand" | "service"> = {},
  ) {
    try {
      const session = await createTerminal(cwd, projectName, options);
      const terminal = createXTerm(session.id, appearanceTheme, setToast, recordTerminalInputActivity);
      const tab: TerminalTab = {
        session,
        terminal: terminal.instance,
        fitAddon: terminal.fitAddon,
        disposables: terminal.disposables,
        activityState: "idle",
        outputBurstStartedAt: null,
      };

      setSpaces((current) => {
        const existing = current[projectId] ?? {
          projectId,
          projectName,
          path: cwd,
          tabs: [],
          activeId: null,
        };
        return {
          ...current,
          [projectId]: {
            ...existing,
            projectName,
            path: cwd,
            tabs: [...existing.tabs, tab],
            activeId: session.id,
          },
        };
      });
      setActiveProjectId(projectId);
    } catch (error) {
      if (!quiet) {
        setToast({ tone: "error", message: asMessage(error) });
      }
    }
  }

  async function toggleService(service: NonNullable<ProjectCandidate["services"]>[number]) {
    if (!candidate?.path) {
      return;
    }
    const existing = selectedSpace?.tabs.find((tab) => tab.session.service?.id === service.id && tab.session.status === "running");
    if (existing) {
      await closeTab(existing.session.id);
      return;
    }
    await openProjectTab(candidate.id, service.cwd, candidate.name, false, {
      initialCommand: service.command,
      service: {
        id: service.id,
        label: service.label,
        command: service.command,
      },
    });
  }

  function appendTerminalOutput(event: TerminalDataEvent) {
    const tab = findTerminalTab(spacesRef.current, event.sessionId);
    tab?.terminal.write(event.data);
    recordTerminalOutputActivity(event.sessionId);
  }

  function recordTerminalOutputActivity(sessionId: string) {
    const tab = findTerminalTab(spacesRef.current, sessionId);
    if (!tab || tab.session.status !== "running") {
      return;
    }

    const now = Date.now();
    setSpaces((current) => mapTerminalTab(current, sessionId, (currentTab) => {
      if (currentTab.session.status !== "running") {
        return currentTab;
      }
      const burstStartedAt = currentTab.outputBurstStartedAt ?? now;
      const sustained = now - burstStartedAt >= terminalWorkingThresholdMs;
      return {
        ...currentTab,
        activityState: sustained ? "working" : currentTab.activityState === "done" ? "idle" : currentTab.activityState,
        outputBurstStartedAt: burstStartedAt,
      };
    }));

    scheduleTerminalQuietTimer(sessionId);
  }

  function recordTerminalInputActivity(sessionId: string) {
    clearTerminalQuietTimer(sessionId);
    setSpaces((current) => mapTerminalTab(current, sessionId, (currentTab) => ({
      ...currentTab,
      activityState: currentTab.activityState === "done" ? "done" : "idle",
      outputBurstStartedAt: null,
    })));
  }

  function scheduleTerminalQuietTimer(sessionId: string) {
    const existingTimer = quietTimers.current.get(sessionId);
    if (existingTimer) {
      window.clearTimeout(existingTimer);
    }
    const timer = window.setTimeout(() => {
      quietTimers.current.delete(sessionId);
      const currentSpaces = spacesRef.current;
      const isCurrentTab = isCurrentOpenTerminalTab(currentSpaces, sessionId, activeProjectIdRef.current);
      setSpaces((current) => mapTerminalTab(current, sessionId, (currentTab) => ({
        ...currentTab,
        activityState: currentTab.activityState === "working" && !isCurrentTab ? "done" : "idle",
        outputBurstStartedAt: null,
      })));
    }, terminalQuietDoneMs);
    quietTimers.current.set(sessionId, timer);
  }

  function clearTerminalQuietTimer(sessionId: string) {
    const timer = quietTimers.current.get(sessionId);
    if (!timer) {
      return;
    }
    window.clearTimeout(timer);
    quietTimers.current.delete(sessionId);
  }

  function clearTerminalDoneState(sessionId: string) {
    const tab = findTerminalTab(spacesRef.current, sessionId);
    if (tab?.activityState !== "done") {
      return;
    }
    setSpaces((current) => mapTerminalTab(current, sessionId, (currentTab) => ({
      ...currentTab,
      activityState: "idle",
    })));
  }

  function markTerminalExit(event: TerminalExitEvent) {
    clearTerminalQuietTimer(event.sessionId);
    const message = `\r\n[process exited${event.exitCode === null ? "" : ` with code ${event.exitCode}`}${event.signal ? `, signal ${event.signal}` : ""}]\r\n`;
    const match = findTerminalTabWithSpace(spacesRef.current, event.sessionId);
    if (match?.tab.session.service) {
      match.tab.terminal.write(message);
      void closeTerminal(event.sessionId).catch(() => undefined);
      removeTerminalTab(event.sessionId, match);
      return;
    }
    match?.tab.terminal.write(message);
    setSpaces((current) => mapTerminalTab(current, event.sessionId, (currentTab) => ({
      ...currentTab,
      activityState: "idle",
      outputBurstStartedAt: null,
      session: { ...currentTab.session, status: "exited" },
    })));
  }

  function updateTerminalSession(event: TerminalUpdateEvent) {
    setSpaces((current) => mapTerminalTab(current, event.session.id, (currentTab) => ({
      ...currentTab,
      session: event.session,
    })));
  }

  async function closeTab(sessionId: string) {
    const match = findTerminalTabWithSpace(spacesRef.current, sessionId);
    try {
      await closeTerminal(sessionId);
    } catch (error) {
      setToast({ tone: "error", message: asMessage(error) });
    } finally {
      removeTerminalTab(sessionId, match);
    }
  }

  function removeTerminalTab(sessionId: string, match: ReturnType<typeof findTerminalTabWithSpace>) {
    clearTerminalQuietTimer(sessionId);
    match?.tab.disposables.forEach((disposable) => disposable.dispose());
    match?.tab.terminal.dispose();
    setSpaces((current) => {
      if (!match) {
        return current;
      }
      const space = current[match.space.projectId];
      if (!space) {
        return current;
      }
      const nextTabs = space.tabs.filter((tab) => tab.session.id !== sessionId);
      const closingActive = space.activeId === sessionId;
      const fallback = nextTabs[match.index] ?? nextTabs[match.index - 1] ?? null;
      return {
        ...current,
        [space.projectId]: {
          ...space,
          tabs: nextTabs,
          activeId: closingActive ? fallback?.session.id ?? null : space.activeId,
        },
      };
    });
  }

  const terminalHeading = candidate?.name ?? "Terminal";

  return (
    <div className="terminal-layout">
      <div className="terminal-header">
        <div>
          <h3>{terminalHeading}</h3>
          <div className="path-line">{selectedSpace?.path ?? candidate?.path ?? "Select a project"}</div>
        </div>
        {services.length ? (
          <div className="service-actions" aria-label="Project services">
            {services.map((service) => {
              const running = Boolean(selectedSpace?.tabs.some((tab) => tab.session.service?.id === service.id && tab.session.status === "running"));
              return (
                <button
                  aria-label={`${running ? "Stop" : "Start"} ${service.label}`}
                  className={cx("service-pill", running && "is-running")}
                  disabled={!canCreate}
                  key={service.id}
                  title={`${running ? "Stop" : "Start"} ${service.command}`}
                  type="button"
                  onClick={() => void toggleService(service)}
                >
                  <span className="service-dot" aria-hidden="true" />
                  <span className="service-pill-label">{service.label}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="terminal-space-stack">
        {Object.values(spaces).map((space) => (
          <div className={cx("terminal-space", space.projectId === activeProjectId && "is-active")} key={space.projectId}>
            <div className="terminal-tabs">
              {space.tabs.length ? (
                <div className="terminal-tab-list" role="tablist">
                  {space.tabs.map((tab) => (
                    <div className={cx("terminal-tab", tab.session.id === space.activeId && "is-active")} key={tab.session.id} role="tab" aria-selected={tab.session.id === space.activeId}>
                      <button
                        className="terminal-tab-main"
                        type="button"
                        onClick={() => {
                          setActiveTab(space.projectId, tab.session.id);
                          clearTerminalDoneState(tab.session.id);
                        }}
                      >
                        <span
                          className={cx(
                            "terminal-state",
                            tab.activityState === "working" && "is-working",
                            tab.activityState === "done" && "is-done",
                            tab.session.status === "exited" && "is-exited",
                          )}
                        />
                        <span className="truncate">{tab.session.title}</span>
                      </button>
                      <button
                        aria-label={`Close ${tab.session.title}`}
                        className="terminal-tab-close"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          void closeTab(tab.session.id);
                        }}
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
              <button aria-label="New terminal tab" className="icon-button terminal-tab-add" disabled={!canCreate} title="New terminal tab" type="button" onClick={() => void openCurrentProjectTab()}>
                <PlusIcon />
              </button>
            </div>
            <div className="xterm-surface-stack">
              {space.tabs.map((tab) => (
                <XTermSurface
                  active={isVisible && space.projectId === activeProjectId && tab.session.id === space.activeId}
                  key={tab.session.id}
                  tab={tab}
                  onResize={(cols, rows) => void resizeTerminal(tab.session.id, cols, rows).catch((error) => setToast({ tone: "error", message: asMessage(error) }))}
                />
              ))}
              {!space.tabs.length ? (
                <div className="xterm-empty-state">
                  <EmptyState
                    title="No terminal open"
                    body="Open a tab for the selected project."
                  />
                </div>
              ) : null}
            </div>
          </div>
        ))}
        {!Object.values(spaces).length ? (
          <div className="terminal-space is-active terminal-empty-space">
            <div className="terminal-tabs">
              <button aria-label="New terminal tab" className="icon-button terminal-tab-add" disabled={!canCreate} title="New terminal tab" type="button" onClick={() => void openCurrentProjectTab()}>
                <PlusIcon />
              </button>
            </div>
            <div className="xterm-surface-stack">
              <div className="xterm-empty-state">
                <EmptyState
                  title="No terminal open"
                  body={candidate ? "Open a tab for the selected project." : "Select a project to start a shell."}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );

  function setActiveTab(projectId: string, sessionId: string) {
    setSpaces((current) => {
      const space = current[projectId];
      if (!space) {
        return current;
      }
      return {
        ...current,
        [projectId]: {
          ...space,
          activeId: sessionId,
        },
      };
    });
  }
});

function XTermSurface({
  active,
  onResize,
  tab,
}: {
  active: boolean;
  onResize: (cols: number, rows: number) => void;
  tab: TerminalTab;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const openedRef = useRef(false);

  useEffect(() => {
    if (!hostRef.current || openedRef.current) {
      return;
    }
    tab.terminal.open(hostRef.current);
    openedRef.current = true;
  }, [tab]);

  useEffect(() => {
    if (!active || !openedRef.current) {
      return;
    }
    const fitAndResize = () => {
      const dimensions = tab.fitAddon.proposeDimensions();
      if (!dimensions) {
        return;
      }
      if (!validTerminalResizeDimensions(dimensions.cols, dimensions.rows)) {
        return;
      }
      tab.fitAddon.fit();
      onResize(Math.floor(dimensions.cols), Math.floor(dimensions.rows));
    };
    const frame = window.requestAnimationFrame(() => {
      fitAndResize();
      tab.terminal.focus();
    });
    const observer = new ResizeObserver(() => fitAndResize());
    if (hostRef.current) {
      observer.observe(hostRef.current);
    }
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [active, onResize, tab]);

  return (
    <div
      aria-hidden={!active}
      className={cx("xterm-surface", active && "is-active")}
      ref={hostRef}
    />
  );
}

function createXTerm(
  sessionId: string,
  appearanceTheme: AppearanceTheme,
  setToast: (toast: Toast) => void,
  onInput: (sessionId: string) => void,
): { instance: XTerm; fitAddon: FitAddon; disposables: Disposable[] } {
  const instance = new XTerm({
    allowTransparency: false,
    cursorBlink: true,
    fontFamily: 'ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace',
    fontSize: 12,
    scrollback: 5000,
    theme: terminalThemes[appearanceTheme],
  });
  const fitAddon = new FitAddon();
  instance.loadAddon(fitAddon);
  instance.loadAddon(new WebLinksAddon());
  const inputDisposable = instance.onData((data) => {
    if (shouldResetTerminalObservationForInput(data)) {
      onInput(sessionId);
    }
    void sendTerminalInput(sessionId, data).catch((error) => {
      setToast({ tone: "error", message: asMessage(error) });
    });
  });
  return {
    instance,
    fitAddon,
    disposables: [inputDisposable],
  };
}

function findTerminalTab(spaces: Record<string, TerminalSpace>, sessionId: string): TerminalTab | null {
  return findTerminalTabWithSpace(spaces, sessionId)?.tab ?? null;
}

function findTerminalTabWithSpace(
  spaces: Record<string, TerminalSpace>,
  sessionId: string,
): { space: TerminalSpace; tab: TerminalTab; index: number } | null {
  for (const space of Object.values(spaces)) {
    const index = space.tabs.findIndex((tab) => tab.session.id === sessionId);
    if (index >= 0) {
      const tab = space.tabs[index];
      if (tab) {
        return { space, tab, index };
      }
    }
  }
  return null;
}

function isCurrentOpenTerminalTab(
  spaces: Record<string, TerminalSpace>,
  sessionId: string,
  activeProjectId: string | null,
): boolean {
  const match = findTerminalTabWithSpace(spaces, sessionId);
  return Boolean(match && match.space.projectId === activeProjectId && match.space.activeId === sessionId);
}

function mapTerminalTab(
  spaces: Record<string, TerminalSpace>,
  sessionId: string,
  mapTab: (tab: TerminalTab) => TerminalTab,
): Record<string, TerminalSpace> {
  let changed = false;
  const nextSpaces = Object.fromEntries(
    Object.entries(spaces).map(([projectId, space]) => {
      const nextTabs = space.tabs.map((tab) => {
        if (tab.session.id !== sessionId) {
          return tab;
        }
        changed = true;
        return mapTab(tab);
      });
      return [
        projectId,
        changed ? { ...space, tabs: nextTabs } : space,
      ];
    }),
  );
  return changed ? nextSpaces : spaces;
}

function RootWorkflowPanel({
  bridgeAvailable,
  lastScanAt,
  loading,
  projects,
  roots,
  scanErrors,
  unavailableRootCount,
  onAdd,
  onRemove,
  onScan,
  setToast,
}: {
  bridgeAvailable: boolean;
  lastScanAt: string | null;
  loading: boolean;
  projects: ProjectSummary[];
  roots: RootRecord[];
  scanErrors: string[];
  unavailableRootCount: number;
  onAdd: (path: string) => Promise<void>;
  onRemove: (path: string) => Promise<void>;
  onScan: () => Promise<void>;
  setToast: (toast: Toast) => void;
}) {
  const [path, setPath] = useState("");
  const [busyPath, setBusyPath] = useState<string | null>(null);
  const firstRun = roots.length === 0;

  async function submit(event: FormEvent) {
    event.preventDefault();
    const nextPath = path.trim();

    if (!nextPath) {
      setToast({ tone: "error", message: "Enter a configured root path before adding it." });
      return;
    }

    setBusyPath(nextPath);

    try {
      await onAdd(nextPath);
      setPath("");
      setToast({ tone: "success", message: "Root added and scanned." });
    } catch (error) {
      setToast({ tone: "error", message: asMessage(error) });
    } finally {
      setBusyPath(null);
    }
  }

  async function remove(pathToRemove: string) {
    setBusyPath(pathToRemove);

    try {
      await onRemove(pathToRemove);
      setToast({ tone: "success", message: "Root removed." });
    } catch (error) {
      setToast({ tone: "error", message: asMessage(error) });
    } finally {
      setBusyPath(null);
    }
  }

  return (
    <section className={cx("workflow-panel", firstRun && "is-first-run")}>
      <div className="workflow-copy">
        <div className="eyebrow">{firstRun ? "First run" : "Configured roots"}</div>
        <h3>{firstRun ? "Choose a parent folder to scan" : "Scan roots"}</h3>
        <p>
          Add one or more parent folders. The Projects view scans only these locations.
        </p>
      </div>

      <form className="root-form dashboard-root-form" onSubmit={(event) => void submit(event)}>
        <label>
          <span>Folder path</span>
          <input
            className="input"
            placeholder="/path/to/projects"
            value={path}
            onChange={(event) => setPath(event.target.value)}
          />
        </label>
        <button className="button" disabled={!bridgeAvailable || !path.trim() || Boolean(busyPath)} type="submit">
          {firstRun ? "Add root" : "Add another root"}
        </button>
      </form>

      <div className="scan-strip" aria-live="polite">
        {lastScanAt ? <span>Last scan: {formatScanTime(lastScanAt)}</span> : null}
        <span>{projects.length} project{projects.length === 1 ? "" : "s"}</span>
        {unavailableRootCount ? <span>{unavailableRootCount} unavailable root{unavailableRootCount === 1 ? "" : "s"}</span> : null}
        {scanErrors.length ? <span>{scanErrors.length} scan issue{scanErrors.length === 1 ? "" : "s"}</span> : null}
        <button className="button secondary compact" disabled={!bridgeAvailable || loading || roots.length === 0} type="button" onClick={() => void onScan()}>
          {loading ? "Scanning" : "Scan all roots"}
        </button>
      </div>

      {roots.length ? (
        <div className="root-list" aria-label="Configured scan roots">
          {roots.map((root) => (
            <div className={cx("root-row", (root.unavailable || root.available === false) && "is-unavailable")} key={root.path}>
              <span className="truncate" title={root.path}>
                {root.path}
              </span>
              {root.unavailable || root.available === false ? <span className="root-state">Unavailable</span> : null}
              <button className="button secondary compact" disabled={busyPath === root.path} type="button" onClick={() => void remove(root.path)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {!firstRun && projects.length === 0 && !loading ? (
        <div className="empty-inline">No managed projects found yet. Scan a parent folder that contains a project with Ripple files installed.</div>
      ) : null}
    </section>
  );
}

function sameStringSet(left: Set<string>, right: Set<string>): boolean {
  if (left.size !== right.size) {
    return false;
  }
  for (const value of left) {
    if (!right.has(value)) {
      return false;
    }
  }
  return true;
}

function sameProjectTerminalActivityStates(
  left: Record<string, ProjectTerminalActivityState>,
  right: Record<string, ProjectTerminalActivityState>,
): boolean {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) {
    return false;
  }
  return leftKeys.every((key) => left[key] === right[key]);
}

function ProjectTable({
  candidates,
  group,
  projectById,
  runningServiceProjectIds,
  terminalActivityByProjectId,
  selectedId,
  title,
  onContextMenu,
  onSelect,
}: {
  candidates: ProjectCandidate[];
  group: CandidateGroup;
  projectById: Map<string, ProjectSummary>;
  runningServiceProjectIds: Set<string>;
  terminalActivityByProjectId: Record<string, ProjectTerminalActivityState>;
  selectedId: string | null;
  title: string;
  onSelect: (id: string) => void;
  onContextMenu?: (project: ProjectSummary, event: ReactMouseEvent<HTMLButtonElement>) => void;
}) {
  if (!candidates.length) {
    return null;
  }

  return (
    <section className={cx("project-section", `is-${group}`)}>
      <div className="project-section-title">
        <h4>{title}</h4>
      </div>
      <div className="project-list" aria-label={`${title} projects`}>
        {candidates.map((candidate) => {
          const project = candidate.managedProjectId ? projectById.get(candidate.managedProjectId) : null;
          const taskTitle = activeTaskTitle(project ?? null);
          const hasRunningService = runningServiceProjectIds.has(candidate.id);
          const terminalActivity = terminalActivityForCandidate(candidate, terminalActivityByProjectId);
          const hasProjectStatus = Boolean(terminalActivity) || Boolean(project && project.dirtyWorktree !== false);

          return (
            <button
              className={cx("project-row", candidate.status === "not_setup" && "is-not-setup", selectedId === candidate.id && "is-selected")}
              key={candidate.id}
              onClick={() => onSelect(candidate.id)}
              onContextMenu={project && onContextMenu ? (event) => onContextMenu(project, event) : undefined}
            >
              <ProjectIcon name={candidate.name} sources={candidate.iconSources ?? project?.iconSources ?? []} />
              <span className="project-row-main">
                <span className="cell-title">
                  {hasRunningService ? <span className="project-service-dot" aria-label="Service running" /> : null}
                  <span className="cell-title-text truncate">{candidate.name}</span>
                </span>
                {taskTitle ? <span className="cell-subtitle truncate">{taskTitle}</span> : null}
                <span className="cell-subtitle truncate">{candidate.path}</span>
              </span>
              {hasProjectStatus ? (
                <span className="project-row-status">
                  {terminalActivity ? (
                    <span className={cx("terminal-activity-pill", terminalActivity === "working" ? "is-working" : "is-idle")}>
                      {terminalActivity}
                    </span>
                  ) : null}
                  {project && project.dirtyWorktree !== false ? (
                    <span className={cx("worktree-pill", project.dirtyWorktree && "is-dirty")}>
                      {project.dirtyWorktree === null ? "git unknown" : "dirty"}
                    </span>
                  ) : null}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ProjectIcon({ name, sources }: { name: string; sources: NonNullable<ProjectCandidate["iconSources"]> }) {
  const signature = sources.map((source) => source.url).join("|");
  const [failedCount, setFailedCount] = useState(0);

  useEffect(() => {
    setFailedCount(0);
  }, [signature]);

  const source = sources[failedCount];
  const imageUrl = source?.url ?? defaultProjectIconUrl;
  const isSharkAppIcon = source?.kind === "local" && /^shark(?:-(?:morning|day|night))?\.png$/u.test(source.label);

  return (
    <span className={cx("project-icon", !source && "is-default", isSharkAppIcon && "is-shark-app")} aria-hidden="true" title={`${name} icon`}>
      <img
        alt=""
        draggable={false}
        src={imageUrl}
        onError={() => {
          setFailedCount((current) => (current < sources.length ? current + 1 : current));
        }}
      />
    </span>
  );
}

function NotSetupPane({
  bridgeAvailable,
  candidate,
  configuredRoots,
  loading,
  setToast,
  onRefresh,
  onSelect,
}: {
  bridgeAvailable: boolean;
  candidate: ProjectCandidate;
  configuredRoots: string[];
  loading: boolean;
  setToast: (toast: Toast) => void;
  onRefresh: () => Promise<void>;
  onSelect: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [setupState, setSetupState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");
  const busy = setupState === "saving" || loading;

  useEffect(() => {
    setConfirming(false);
    setSetupState("idle");
    setMessage("");
  }, [candidate.id]);

  async function setupRipple() {
    setSetupState("saving");
    setMessage("");

    try {
      const result = await createHarnessRepo({
        targetDir: candidate.path,
        configuredRoots,
        projectName: candidate.name,
        allowExistingDirectory: true,
      });

      if (result.ok === false || result.error) {
        throw new Error(result.message ?? result.error ?? "Ripple setup failed.");
      }

      setSetupState("saved");
      setConfirming(false);
      setToast({ tone: "success", message: "Ripple setup installed." });
      await onRefresh();
      onSelect(candidate.id);
    } catch (error) {
      setSetupState("error");
      setMessage(asMessage(error));
      setToast({ tone: "error", message: asMessage(error) });
    }
  }

  return (
    <div className="detail-layout">
      <section className="subpanel current-task-card">
        <div className="panel-title-row">
          <div>
            <h4>Set up Ripple</h4>
          </div>
          {!confirming ? (
            <button className="button compact" disabled={!bridgeAvailable || busy} type="button" onClick={() => setConfirming(true)}>
              Set up
            </button>
          ) : null}
        </div>
        {!confirming ? <p className="summary-text">Add harness files to this project without changing existing files.</p> : null}
        {confirming ? (
          <div className="confirm-panel">
            <p className="summary-text">This adds `AGENTS.md` and contained `.sharkbay` harness files. Existing files will not be overwritten.</p>
            <div className="button-row">
              <button className="button secondary compact" disabled={busy} type="button" onClick={() => setConfirming(false)}>
                Cancel
              </button>
              <button className="button compact" disabled={!bridgeAvailable || busy} type="button" onClick={() => void setupRipple()}>
                {setupState === "saving" ? "Setting up" : "Confirm setup"}
              </button>
            </div>
          </div>
        ) : null}
        {message ? <div className="feedback-line is-error">{message}</div> : null}
      </section>
    </div>
  );
}

function ProjectDetailPane({
  detail,
  project,
  setToast,
  onRefresh,
  onOpenFileInEditor,
  onOpenGitDiff,
}: {
  detail: ProjectDetail | null;
  project: ProjectSummary;
  setToast: (toast: Toast) => void;
  onRefresh: () => Promise<void>;
  onOpenFileInEditor: (relativePath: string) => Promise<void>;
  onOpenGitDiff: (relativePath: string) => Promise<void>;
}) {
  const [detailMode, setDetailMode] = useState<DetailMode>("overview");
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>("tasks");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const resolved = detail?.id === project.id ? detail : project;
  const detailLike = resolved as ProjectDetail;

  useEffect(() => {
    setDetailMode("overview");
    setActiveDetailTab((current) => current === "files" ? "files" : "tasks");
    setSelectedTaskId(null);
  }, [project.id]);

  if (detailMode === "task" && selectedTaskId) {
    return (
      <TaskDetailPage
        detail={detailLike}
        taskId={selectedTaskId}
        onBack={() => {
          setDetailMode("overview");
          setSelectedTaskId(null);
        }}
      />
    );
  }

  function openDetailTab(tab: DetailTab) {
    setActiveDetailTab(tab);
    setDetailMode("overview");
    setSelectedTaskId(null);
  }

  function focusDetailTab(tab: DetailTab) {
    window.requestAnimationFrame(() => document.getElementById(`project-detail-tab-${tab}`)?.focus());
  }

  function handleDetailTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, tab: DetailTab) {
    const currentIndex = detailTabs.findIndex((item) => item.id === tab);
    const lastIndex = detailTabs.length - 1;
    const tabAt = (index: number): DetailTab => detailTabs[index]?.id ?? "tasks";
    let nextTab: DetailTab | null = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextTab = tabAt(currentIndex === lastIndex ? 0 : currentIndex + 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextTab = tabAt(currentIndex <= 0 ? lastIndex : currentIndex - 1);
    } else if (event.key === "Home") {
      nextTab = tabAt(0);
    } else if (event.key === "End") {
      nextTab = tabAt(lastIndex);
    }

    if (!nextTab) {
      return;
    }

    event.preventDefault();
    openDetailTab(nextTab);
    focusDetailTab(nextTab);
  }

  function openTask(taskId: string) {
    setActiveDetailTab("tasks");
    setSelectedTaskId(taskId);
    setDetailMode("task");
  }

  return (
    <div className="detail-layout">
      <HarnessTemplateSyncPanel detail={detailLike} setToast={setToast} onRefresh={onRefresh} />
      <LegacyHarnessCleanupPanel detail={detailLike} setToast={setToast} onRefresh={onRefresh} />
      <div className="detail-tab-cards" role="tablist" aria-label="Project detail sections">
        {detailTabs.map((tab) => (
          <button
            aria-controls={`project-detail-tabpanel-${tab.id}`}
            aria-selected={activeDetailTab === tab.id}
            className={cx("detail-tab-card", activeDetailTab === tab.id && "is-active")}
            id={`project-detail-tab-${tab.id}`}
            key={tab.id}
            role="tab"
            tabIndex={activeDetailTab === tab.id ? 0 : -1}
            type="button"
            onKeyDown={(event) => handleDetailTabKeyDown(event, tab.id)}
            onClick={() => openDetailTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        aria-labelledby="project-detail-tab-tasks"
        className="detail-tab-panel"
        hidden={activeDetailTab !== "tasks"}
        id="project-detail-tabpanel-tasks"
        role="tabpanel"
      >
        <TasksDetailTab
          detail={detailLike}
          onSelectTask={openTask}
        />
      </div>
      <div
        aria-labelledby="project-detail-tab-decisions"
        className="detail-tab-panel"
        hidden={activeDetailTab !== "decisions"}
        id="project-detail-tabpanel-decisions"
        role="tabpanel"
      >
        <DecisionsDetailTab detail={detailLike} />
      </div>
      <div
        aria-labelledby="project-detail-tab-git"
        className="detail-tab-panel"
        hidden={activeDetailTab !== "git"}
        id="project-detail-tabpanel-git"
        role="tabpanel"
      >
        <GitDetailTab detail={detailLike} setToast={setToast} onOpenGitDiff={onOpenGitDiff} />
      </div>
      <div
        aria-labelledby="project-detail-tab-info"
        className="detail-tab-panel"
        hidden={activeDetailTab !== "info"}
        id="project-detail-tabpanel-info"
        role="tabpanel"
      >
        <InfoDetailTab detail={detailLike} />
      </div>
      <div
        aria-labelledby="project-detail-tab-files"
        className="detail-tab-panel"
        hidden={activeDetailTab !== "files"}
        id="project-detail-tabpanel-files"
        role="tabpanel"
      >
        <FilesDetailTab
          active={activeDetailTab === "files"}
          detail={detailLike}
          setToast={setToast}
          onOpenFileInEditor={onOpenFileInEditor}
        />
      </div>
    </div>
  );
}

function LegacyHarnessCleanupPanel({
  detail,
  setToast,
  onRefresh,
}: {
  detail: ProjectDetail;
  setToast: (toast: Toast) => void;
  onRefresh: () => Promise<void>;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const cleanup = detail.legacyHarnessCleanup;
  const isReady = cleanup?.status === "ready";
  const isBlocked = cleanup?.status === "blocked";

  useEffect(() => {
    setConfirmed(false);
    setMigrating(false);
  }, [detail.id, cleanup?.status, cleanup?.moves.map((move) => `${move.source}:${move.target}`).join("\n")]);

  if (!cleanup || (!isReady && !isBlocked)) {
    return null;
  }

  async function migrate() {
    setMigrating(true);
    try {
      const result = await migrateLegacyHarness(detail);
      if (!result.ok) {
        throw new Error(result.message);
      }
      setConfirmed(false);
      setToast({ tone: "success", message: "Legacy harness moved into .sharkbay." });
      await onRefresh();
    } catch (error) {
      setToast({ tone: "error", message: asMessage(error) });
    } finally {
      setMigrating(false);
    }
  }

  return (
    <section className={cx("subpanel", "harness-sync-card", isBlocked && "is-missing")}>
      <div className="panel-title-row">
        <div>
          <h4>{isBlocked ? "Legacy harness cleanup blocked" : "Legacy harness ready to move"}</h4>
          <p className="summary-text">{cleanup.message}</p>
        </div>
      </div>
      {cleanup.moves.length ? (
        <div className="info-chip-row" aria-label="Legacy harness files to move">
          {cleanup.moves.slice(0, 12).map((move) => (
            <span className="info-chip mono-chip" key={`${move.source}:${move.target}`}>
              {move.source}
              {" -> "}
              {move.target}
            </span>
          ))}
          {cleanup.moves.length > 12 ? <span className="info-chip">+{cleanup.moves.length - 12}</span> : null}
        </div>
      ) : null}
      {cleanup.blockers.length ? (
        <ul className="diagnostic-list">
          {cleanup.blockers.map((blocker) => (
            <li key={blocker}>{blocker}</li>
          ))}
        </ul>
      ) : null}
      {isReady ? (
        <div className="confirm-panel">
          <label className="checkbox-row">
            <input checked={confirmed} disabled={migrating} type="checkbox" onChange={(event) => setConfirmed(event.currentTarget.checked)} />
            <span>Move only the listed legacy harness files</span>
          </label>
          <div className="button-row">
            <button className="button compact" disabled={!confirmed || migrating} type="button" onClick={() => void migrate()}>
              {migrating ? "Moving" : "Move to .sharkbay"}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function HarnessTemplateSyncPanel({
  detail,
  setToast,
  onRefresh,
}: {
  detail: ProjectDetail;
  setToast: (toast: Toast) => void;
  onRefresh: () => Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const template = detail.harnessTemplate;
  const needsSync = template?.status === "stale" || template?.status === "missing";
  const files = [...(template?.staleFiles ?? []), ...(template?.missingFiles ?? [])];

  useEffect(() => {
    setConfirming(false);
    setSyncing(false);
  }, [detail.id, template?.status, files.join("\n")]);

  if (!needsSync || !template) {
    return null;
  }

  async function syncFiles() {
    setSyncing(true);
    try {
      const result = await updateHarnessTemplateFiles(detail);
      if (!result.ok) {
        throw new Error(result.message);
      }
      setConfirming(false);
      setToast({ tone: "success", message: "Harness files synced." });
      await onRefresh();
    } catch (error) {
      setToast({ tone: "error", message: asMessage(error) });
    } finally {
      setSyncing(false);
    }
  }

  return (
    <section className={cx("subpanel", "harness-sync-card", template.status === "missing" && "is-missing")}>
      <div className="panel-title-row">
        <div>
          <h4>Harness files {template.status === "missing" ? "missing" : "out of date"}</h4>
          <p className="summary-text">Shared control files differ from SharkBay's current template.</p>
        </div>
        {!confirming ? (
          <button className="button compact" disabled={syncing} type="button" onClick={() => setConfirming(true)}>
            Sync
          </button>
        ) : null}
      </div>
      <div className="info-chip-row" aria-label="Harness files to sync">
        {files.map((file) => (
          <span className="info-chip mono-chip" key={file}>
            {file}
          </span>
        ))}
      </div>
      {confirming ? (
        <div className="confirm-panel">
          <p className="summary-text">This updates the listed control files only. Project state, tasks, docs, and queues are not changed.</p>
          <div className="button-row">
            <button className="button secondary compact" disabled={syncing} type="button" onClick={() => setConfirming(false)}>
              Cancel
            </button>
            <button className="button compact" disabled={syncing} type="button" onClick={() => void syncFiles()}>
              {syncing ? "Syncing" : "Confirm sync"}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function TasksDetailTab({
  detail,
  onSelectTask,
}: {
  detail: ProjectDetail;
  onSelectTask: (taskId: string) => void;
}) {
  return (
    <>
      <QueueTabs detail={detail} onSelectTask={onSelectTask} />
      <Diagnostics detail={detail} />
    </>
  );
}

function DecisionsDetailTab({ detail }: { detail: ProjectDetail }) {
  return detail.recentDecisions?.length ? (
    <DecisionItems decisions={detail.recentDecisions} limit={null} />
  ) : (
    <EmptyState title="No decisions" body="This project has no recorded decisions yet." />
  );
}

function GitDetailTab({
  detail,
  setToast,
  onOpenGitDiff,
}: {
  detail: ProjectDetail;
  setToast: (toast: Toast) => void;
  onOpenGitDiff: (relativePath: string) => Promise<void>;
}) {
  return (
    <>
      <ProjectFactsCard detail={detail} />
      <DirtyFilesPanel detail={detail} setToast={setToast} onOpenGitDiff={onOpenGitDiff} />
      {detail.gitHistory?.length || detail.currentBranch ? (
        <GitHistoryItems events={detail.gitHistory ?? []} limit={null} />
      ) : (
        <EmptyState title="No git history" body="Restart SharkBay once to load Git history." />
      )}
    </>
  );
}

function InfoDetailTab({ detail }: { detail: ProjectDetail }) {
  return <ProjectInfoCard detail={detail} />;
}

function FilesDetailTab({
  active,
  detail,
  setToast,
  onOpenFileInEditor,
}: {
  active: boolean;
  detail: ProjectDetail;
  setToast: (toast: Toast) => void;
  onOpenFileInEditor: (relativePath: string) => Promise<void>;
}) {
  const [state, setState] = useState<{
    loading: boolean;
    error: string | null;
    files: ProjectFileTreeItem[];
  }>({ loading: false, error: null, files: [] });
  const [expandedDirectories, setExpandedDirectories] = useState<Set<string>>(() => new Set());
  const [loadingDirectories, setLoadingDirectories] = useState<Set<string>>(() => new Set());
  const activeFilesProjectPath = useRef(detail.path);

  useEffect(() => {
    if (!active) {
      return;
    }

    let cancelled = false;
    activeFilesProjectPath.current = detail.path;
    setExpandedDirectories(new Set());
    setLoadingDirectories(new Set());
    setState({ loading: true, error: null, files: [] });
    void listProjectFiles(detail)
      .then((result) => {
        if (cancelled) {
          return;
        }
        if (!result.ok) {
          setState({ loading: false, error: result.message, files: [] });
          return;
        }
        setState({ loading: false, error: null, files: result.files });
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ loading: false, error: asMessage(error), files: [] });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [active, detail.id, detail.path]);

  async function openFile(item: ProjectFileTreeItem) {
    if (item.kind !== "file" || !item.editable) {
      return;
    }
    try {
      await onOpenFileInEditor(item.path);
    } catch (error) {
      setToast({ tone: "error", message: asMessage(error) });
    }
  }

  async function toggleDirectory(item: ProjectFileTreeItem) {
    if (loadingDirectories.has(item.path)) {
      return;
    }
    if (expandedDirectories.has(item.path)) {
      setExpandedDirectories((current) => {
        const next = new Set(current);
        next.delete(item.path);
        return next;
      });
      return;
    }

    if (item.children === undefined) {
      setLoadingDirectories((current) => new Set(current).add(item.path));
      try {
        const result = await listProjectFiles(detail, item.path);
        if (activeFilesProjectPath.current !== detail.path) {
          return;
        }
        if (!result.ok) {
          throw new Error(result.message);
        }
        setState((current) => ({
          ...current,
          files: updateProjectFileChildren(current.files, item.path, result.files),
        }));
      } catch (error) {
        setToast({ tone: "error", message: asMessage(error) });
        return;
      } finally {
        if (activeFilesProjectPath.current === detail.path) {
          setLoadingDirectories((current) => {
            const next = new Set(current);
            next.delete(item.path);
            return next;
          });
        }
      }
    }

    setExpandedDirectories((current) => {
      const next = new Set(current);
      next.add(item.path);
      return next;
    });
  }

  if (state.loading && !state.files.length) {
    return <EmptyState title="Loading files" body="Reading project files." />;
  }

  if (state.error) {
    return <EmptyState title="Files unavailable" body={state.error} />;
  }

  if (!state.files.length) {
    return <EmptyState title="No files" body="This project has no visible files." />;
  }

  return (
    <section className="subpanel files-card">
      <div className="project-file-tree" role="tree" aria-label="Project files">
        {state.files.map((item) => (
          <ProjectFileTreeItemRow
            expandedDirectories={expandedDirectories}
            item={item}
            key={item.path}
            level={1}
            loadingDirectories={loadingDirectories}
            onToggleDirectory={toggleDirectory}
            onOpenFile={openFile}
          />
        ))}
      </div>
    </section>
  );
}

function ProjectFileTreeItemRow({
  expandedDirectories,
  item,
  level,
  loadingDirectories,
  onToggleDirectory,
  onOpenFile,
}: {
  expandedDirectories: Set<string>;
  item: ProjectFileTreeItem;
  level: number;
  loadingDirectories: Set<string>;
  onToggleDirectory: (item: ProjectFileTreeItem) => Promise<void>;
  onOpenFile: (item: ProjectFileTreeItem) => Promise<void>;
}) {
  const expandable = item.kind === "directory" && (item.children === undefined || item.children.length > 0);
  const expanded = expandable && expandedDirectories.has(item.path);
  const loading = loadingDirectories.has(item.path);
  const disabled = item.kind === "file" && !item.editable;
  return (
    <>
      <div
        aria-disabled={disabled || undefined}
        aria-expanded={item.kind === "directory" ? expanded : undefined}
        className={cx("project-file-row", item.kind === "directory" && "is-directory", disabled && "is-disabled")}
        role="treeitem"
        style={{ "--file-tree-level": level } as CSSProperties}
        title={item.path}
      >
        {item.kind === "directory" ? (
          <button
            aria-label={`${expanded ? "Collapse" : "Expand"} ${item.name}`}
            className="project-file-toggle"
            disabled={!expandable}
            type="button"
            onClick={() => void onToggleDirectory(item)}
          >
            {loading ? "." : expandable ? (expanded ? "-" : "+") : ""}
          </button>
        ) : (
          <span className="project-file-toggle" aria-hidden="true" />
        )}
        <button
          className="project-file-action"
          disabled={disabled}
          type="button"
          onDoubleClick={() => void onOpenFile(item)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              if (item.kind === "directory" && expandable) {
                void onToggleDirectory(item);
                return;
              }
              void onOpenFile(item);
            }
          }}
        >
          <span className="project-file-name">{item.name}</span>
        </button>
      </div>
      {expanded ? item.children?.map((child) => (
        <ProjectFileTreeItemRow
          expandedDirectories={expandedDirectories}
          item={child}
          key={child.path}
          level={level + 1}
          loadingDirectories={loadingDirectories}
          onToggleDirectory={onToggleDirectory}
          onOpenFile={onOpenFile}
        />
      )) : null}
    </>
  );
}

function updateProjectFileChildren(items: ProjectFileTreeItem[], targetPath: string, children: ProjectFileTreeItem[]): ProjectFileTreeItem[] {
  return items.map((item) => {
    if (item.path === targetPath) {
      return { ...item, children };
    }
    if (item.children?.length) {
      return { ...item, children: updateProjectFileChildren(item.children, targetPath, children) };
    }
    return item;
  });
}

function DirtyFilesPanel({
  detail,
  setToast,
  onOpenGitDiff,
}: {
  detail: ProjectDetail;
  setToast: (toast: Toast) => void;
  onOpenGitDiff: (relativePath: string) => Promise<void>;
}) {
  const dirtyFiles = detail.gitDirtyFiles ?? [];
  return (
    <section className="subpanel dirty-files-card">
      <div className="panel-title-row compact-title-row">
        <h4>Dirty Files</h4>
        <span className="form-note">{dirtyFiles.length ? `${dirtyFiles.length} changed` : "Clean"}</span>
      </div>
      {dirtyFiles.length ? (
        <div className="dirty-file-list">
          {dirtyFiles.map((file) => (
            <button
              className="dirty-file-row"
              key={`${file.status}-${file.path}`}
              title={`${file.status} ${file.path}`}
              type="button"
              onDoubleClick={() => {
                void onOpenGitDiff(file.path).catch((error) => setToast({ tone: "error", message: asMessage(error) }));
              }}
            >
              <span className="dirty-file-status">{file.status}</span>
              <span className="dirty-file-path">{file.path}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="muted-row compact-muted-row">No dirty files.</div>
      )}
    </section>
  );
}

function ProjectFactsCard({ detail }: { detail: ProjectDetail }) {
  const worktree = detail.dirtyWorktree === null ? null : detail.dirtyWorktree ? "Dirty" : "Clean";
  const facts = [
    { label: "Path", value: detail.path },
    { label: "Repo URL", value: detail.repoUrl },
    { label: "Branch", value: detail.currentBranch },
    { label: "Worktree", value: worktree, tone: detail.dirtyWorktree ? "warn" as const : undefined },
    { label: "Detection", value: detail.detection === "protocol-fallback" ? "Protocol fallback" : "Manifest" },
  ].filter((fact): fact is { label: string; value: string; tone?: "warn" } => Boolean(fact.value));

  return (
    <section className="subpanel project-facts-card">
      <div className="panel-title-row compact-title-row">
        <h4>Repository</h4>
      </div>
      <div className="project-facts-list">
        {facts.map((fact) => (
          <Fact key={fact.label} label={fact.label} tone={fact.tone} value={fact.value} />
        ))}
      </div>
    </section>
  );
}

function ProjectInfoCard({ detail }: { detail: ProjectDetail }) {
  const development = detail.development;
  if (!development) {
    return null;
  }

  const stack = [...new Set(Object.values(development.stack).flat())].slice(0, 10);
  const commandOrder = ["dev", "test", "typecheck", "build", "deploy"];
  const commands = commandOrder
    .flatMap((key) => (development.commands[key] ?? []).slice(0, 1).map((command) => ({ key, command })))
    .slice(0, 5);
  const links = (["local", "test", "production"] as const)
    .flatMap((key) => development.endpoints[key].filter((endpoint) => endpoint.url).map((endpoint) => ({ key, endpoint })))
    .slice(0, 5);
  const ports = development.ports.slice(0, 4);
  const tools = development.tools.slice(0, 8);
  const packageManager = development.environment.packageManager;
  const hasContent = stack.length || commands.length || links.length || ports.length || tools.length || packageManager;

  if (!hasContent) {
    return null;
  }

  return (
    <section className="subpanel project-info-card">
      <div className="panel-title-row compact-title-row">
        <h4>Project Info</h4>
        {development.updatedAt ? <span className="form-note">Updated {formatRelativeTime(development.updatedAt)}</span> : null}
      </div>

      {stack.length ? <InfoChipGroup label="Stack" values={stack} /> : null}
      {links.length ? (
        <div className="info-section">
          <span className="form-note">Links</span>
          <div className="info-chip-row">
            {links.map(({ endpoint, key }) => (
              <a className="info-chip runtime-link" href={endpoint.url ?? undefined} key={`${key}-${endpoint.label}-${endpoint.url}`} rel="noreferrer" target="_blank" title={endpoint.url ?? endpoint.label}>
                {endpoint.label || key}
              </a>
            ))}
          </div>
        </div>
      ) : null}
      {commands.length ? (
        <div className="info-section">
          <span className="form-note">Commands</span>
          <div className="info-chip-row">
            {commands.map(({ command, key }) => (
              <span className="info-chip mono-chip" key={`${key}-${command}`} title={command}>
                {key}: {command}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      {ports.length ? (
        <div className="info-section">
          <span className="form-note">Ports</span>
          <div className="info-chip-row">
            {ports.map((port) => (
              <span className="info-chip" key={`${port.port}-${port.purpose ?? ""}`}>
                {port.port}{port.purpose ? ` · ${port.purpose}` : ""}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      {packageManager || tools.length ? (
        <InfoChipGroup label="Tools" values={[packageManager, ...tools].filter((value): value is string => Boolean(value))} />
      ) : null}
    </section>
  );
}

function InfoChipGroup({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="info-section">
      <span className="form-note">{label}</span>
      <div className="info-chip-row">
        {values.map((value) => (
          <span className="info-chip" key={value}>
            {value}
          </span>
        ))}
      </div>
    </div>
  );
}

function QueueTabs({ detail, onSelectTask }: { detail: ProjectDetail; onSelectTask: (taskId: string) => void }) {
  const activeTaskId = hasMeaningfulActiveTask(detail.activeTask) ? detail.activeTask.taskId : null;
  const seen = new Set<string>();
  const items = (["active", "backlog", "done"] as const)
    .flatMap((section) =>
      (detail.queue?.[section] ?? []).map((item) => ({
        ...item,
        queueSection: section,
      })),
    )
    .filter((item) => {
      if (seen.has(item.taskId)) {
        return false;
      }
      seen.add(item.taskId);
      return true;
    });

  if (hasMeaningfulActiveTask(detail.activeTask) && !seen.has(detail.activeTask.taskId)) {
    items.push({
      dependsOn: [],
      phase: detail.activeTask.phase,
      priority: detail.activeTask.priority ?? undefined,
      queueSection: "active",
      status: detail.activeTask.phase,
      taskId: detail.activeTask.taskId,
      title: detail.activeTask.title,
    });
  }

  const sortedItems = items.sort((a, b) => {
    if (activeTaskId) {
      if (a.taskId === activeTaskId && b.taskId !== activeTaskId) return -1;
      if (b.taskId === activeTaskId && a.taskId !== activeTaskId) return 1;
    }
    return compareQueueItems(a, b);
  });

  if (!sortedItems.length) {
    return null;
  }

  return (
    <section aria-label="Tasks" className="queue-list">
      {sortedItems.map((item) => (
        <QueueItem
          isCurrent={item.taskId === activeTaskId}
          item={item}
          key={`${item.taskId}-${item.phase ?? item.status ?? "task"}`}
          onSelect={() => onSelectTask(item.taskId)}
        />
      ))}
    </section>
  );
}

function QueueItem({ item, isCurrent, onSelect }: { item: TaskQueueItem; isCurrent: boolean; onSelect: () => void }) {
  const status = !isEmptyValue(item.status) ? item.status : null;
  const phase = !isEmptyValue(item.phase) ? item.phase : status;
  const title = !isEmptyValue(item.title) ? item.title : null;
  const priority = typeof item.priority === "number" && item.priority >= 0 ? `P${item.priority}` : null;
  const meta = [
    item.dependsOn?.length ? `Depends on: ${item.dependsOn.join(", ")}` : null,
  ].filter(Boolean);

  return (
    <button className={cx("queue-item", priority && "has-priority", isCurrent && "is-current")} type="button" onClick={onSelect}>
      {priority ? <span className="queue-priority">{priority}</span> : null}
      <span>
        <strong>{item.taskId}</strong>
        {title ? <small>{title}</small> : null}
        {meta.length ? <small>{meta.join(" / ")}</small> : null}
      </span>
      {phase ? <span className={cx("phase-pill", phaseClass(phase))}>{phase}</span> : null}
    </button>
  );
}

function taskPageTitle(item: TaskQueueItem | null, taskId: string): string {
  const shortId = taskId.match(/^t-(\d+)/i)?.[1];
  const displayId = shortId ? `T${shortId}` : taskId;
  return item && !isEmptyValue(item.title) ? `${displayId}: ${item.title}` : displayId;
}

function findQueueItem(detail: ProjectDetail, taskId: string): TaskQueueItem | null {
  return (["active", "backlog", "done"] as const)
    .flatMap((section) => detail.queue?.[section] ?? [])
    .find((item) => item.taskId === taskId) ?? null;
}

function formatMetadataValue(value: unknown): string | null {
  if (typeof value === "string") {
    return isEmptyValue(value) ? null : value;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  if (Array.isArray(value)) {
    const values = value.flatMap((item) => {
      const formatted = formatMetadataValue(item);
      return formatted ? [formatted] : [];
    });
    return values.length ? values.join(", ") : null;
  }
  return null;
}

function taskMetadataRows(item: TaskQueueItem | null): Array<{ label: string; value: string }> {
  if (!item) return [];
  return [
    { label: "Phase", value: formatMetadataValue(item.phase) },
    { label: "Status", value: formatMetadataValue(item.status) },
    { label: "Priority", value: typeof item.priority === "number" && item.priority >= 0 ? `P${item.priority}` : null },
    { label: "Depends On", value: formatMetadataValue(item.dependsOn) },
    { label: "Notes", value: formatMetadataValue(item.notes) },
    { label: "Completed", value: formatMetadataValue(item.completedAt) ?? formatMetadataValue(item.completed) },
  ].filter((row): row is { label: string; value: string } => Boolean(row.value));
}

function artifactsForTask(detail: ProjectDetail, taskId: string): TaskArtifacts | null {
  if (detail.taskArtifacts?.[taskId]) {
    return detail.taskArtifacts[taskId] ?? null;
  }

  if (detail.activeTask?.taskId === taskId) {
    return detail.currentTask ?? null;
  }

  return null;
}

function TaskDetailPage({ detail, taskId, onBack }: { detail: ProjectDetail; taskId: string; onBack: () => void }) {
  const task = findQueueItem(detail, taskId);
  const artifacts = artifactsForTask(detail, taskId);
  const availableKeys = artifactOrder.filter((key) => Boolean(artifacts?.[key]?.trim()));
  const metadataRows = taskMetadataRows(task);
  const [selectedKey, setSelectedKey] = useState<ArtifactKey | null>(availableKeys[0] ?? null);

  useEffect(() => {
    setSelectedKey(availableKeys[0] ?? null);
  }, [taskId]);

  const activeKey = selectedKey && availableKeys.includes(selectedKey) ? selectedKey : availableKeys[0] ?? null;
  const content = activeKey ? artifacts?.[activeKey] || "" : "";

  return (
    <div className="detail-layout task-detail-page">
      <div className="detail-header task-detail-header">
        <button aria-label="Back to tasks" className="icon-button" title="Back to tasks" type="button" onClick={onBack}>
          <ArrowLeftIcon />
        </button>
        <div>
          <h3>{taskPageTitle(task, taskId)}</h3>
          <div className="path-line">{detail.name}</div>
        </div>
      </div>

      <section className="subpanel artifact-panel">
        {availableKeys.length > 1 ? (
          <div className="tab-row wrap">
            {availableKeys.map((key) => (
              <button className={cx("tab-button", activeKey === key && "is-active")} key={key} type="button" onClick={() => setSelectedKey(key)}>
                {artifactLabel(key)}
              </button>
            ))}
          </div>
        ) : null}
        {content ? (
          <pre className="artifact-view full-height">{content}</pre>
        ) : metadataRows.length ? (
          <div className="task-metadata-detail">
            <div className="metadata-list">
              {metadataRows.map((row) => (
                <div className="metadata-row" key={row.label}>
                  <span>{row.label}</span>
                  <strong>{row.value}</strong>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState title="No task detail found" body="This task has no readable task artifact files yet." />
        )}
      </section>
    </div>
  );
}

function artifactLabel(key: ArtifactKey): string {
  const labels: Record<ArtifactKey, string> = {
    statusMarkdown: "Status",
    contractMarkdown: "Contract",
    implementationMarkdown: "Implementation",
    verificationMarkdown: "Verification",
    codeReviewMarkdown: "Code Review",
    designMarkdown: "Design",
    designReviewMarkdown: "Design Review",
    specMarkdown: "Spec",
    decisionsMarkdown: "Decisions",
  };
  return labels[key];
}

function DecisionItems({ decisions, limit }: { decisions: ProjectDetail["recentDecisions"]; limit: number | null }) {
  const sorted = [...(decisions ?? [])].reverse();
  const visible = limit === null ? sorted : sorted.slice(0, limit);

  return (
    <div className="decision-list">
      {visible.map((decision) => (
        <div className="decision-item" key={`${decision.date}-${decision.source}-${decision.decision}`}>
          {decision.source ? <div className="decision-meta">{decision.source}</div> : null}
          <div>{decision.decision}</div>
          <div className="history-time" title={formatHistoryTime(decision.date)}>
            {formatRelativeTime(decision.date)}
          </div>
        </div>
      ))}
    </div>
  );
}

function GitHistoryItems({ events, limit }: { events: ProjectDetail["gitHistory"]; limit: number | null }) {
  const visible = limit === null ? events ?? [] : (events ?? []).slice(0, limit);

  return (
    <div className="decision-list">
      {visible.map((event) => (
        <div className="decision-item" key={`${event.selector}-${event.hash}-${event.date}`}>
          <div className="decision-meta">
            {event.hash.slice(0, 7)} / {event.selector}
          </div>
          <div>{event.action}</div>
          <div className="history-time" title={formatHistoryTime(event.date)}>
            {formatRelativeTime(event.date)}
          </div>
        </div>
      ))}
      {!visible.length ? <div className="muted-row">Restart SharkBay once to load Git history.</div> : null}
    </div>
  );
}

function projectHasDiagnostics(detail: ProjectDetail): boolean {
  return Boolean(detail.parseErrors?.length || detail.syncWarnings?.length || detail.errors?.length || detail.reviewSummary || detail.evidenceSummary);
}

function Diagnostics({ detail }: { detail: ProjectDetail }) {
  const messages = [...(detail.parseErrors ?? []), ...(detail.syncWarnings ?? []), ...(detail.errors ?? [])].map((message) =>
    typeof message === "string" ? message : `${message.file ?? "project files"}: ${message.message}`,
  );

  if (!messages.length && !detail.reviewSummary && !detail.evidenceSummary) {
    return null;
  }

  return (
    <section className="subpanel">
      <h4>Diagnostics</h4>
      {messages.length ? (
        <div className="inline-errors">
          {messages.map((message) => (
            <div key={message}>{message}</div>
          ))}
        </div>
      ) : null}
      {detail.reviewSummary ? <p className="summary-text">{detail.reviewSummary}</p> : null}
      {detail.evidenceSummary ? <p className="summary-text">{detail.evidenceSummary}</p> : null}
    </section>
  );
}

function SettingsView({
  appearanceTheme,
  roots,
  bridgeAvailable,
  lastScanAt,
  loading,
  projects,
  scanErrors,
  setToast,
  onBack,
  onScan,
  onAdd,
  onRemove,
  onThemeChange,
}: {
  appearanceTheme: AppearanceTheme;
  roots: RootRecord[];
  bridgeAvailable: boolean;
  lastScanAt: string | null;
  loading: boolean;
  projects: ProjectSummary[];
  scanErrors: string[];
  setToast: (toast: Toast) => void;
  onBack: () => void;
  onScan: () => Promise<void>;
  onAdd: (path: string) => Promise<void>;
  onRemove: (path: string) => Promise<void>;
  onThemeChange: (theme: AppearanceTheme) => Promise<void>;
}) {
  const unavailableRootCount = roots.filter((root) => root.unavailable || root.available === false).length;
  const [activeSection, setActiveSection] = useState<SettingsSection>("project-roots");

  return (
    <div className="settings-layout">
      <div className="detail-header settings-header">
        <button aria-label="Back to projects" className="icon-button" title="Back to projects" type="button" onClick={onBack}>
          <ArrowLeftIcon />
        </button>
        <div>
          <h3>Settings</h3>
          <div className="path-line">
            Scan roots and local project access
          </div>
        </div>
      </div>
      <div className="settings-shell">
        <aside className="settings-nav" aria-label="Settings sections">
          {settingsSections.map((section) => {
            const selected = section.id === activeSection;
            const count = section.id === "project-roots"
              ? roots.length
              : unavailableRootCount + scanErrors.length;
            const meta = section.id === "project-roots"
              ? `${roots.length} root${roots.length === 1 ? "" : "s"}`
              : count ? `${count} issue${count === 1 ? "" : "s"}` : "Clear";

            return (
              <button
                aria-current={selected ? "page" : undefined}
                className={cx("settings-nav-item", selected && "is-selected")}
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
              >
                <span>{section.label}</span>
                <small>{meta}</small>
              </button>
            );
          })}
        </aside>
        <section className="settings-content" aria-label="Settings content">
          <div className="settings-section-panel" hidden={activeSection !== "project-roots"}>
            <div className="settings-section-heading">
              <h4>Project roots</h4>
              <span>{projects.length} project{projects.length === 1 ? "" : "s"}</span>
            </div>
            <AppearanceSettingsPanel
              appearanceTheme={appearanceTheme}
              setToast={setToast}
              onThemeChange={onThemeChange}
            />
            <RootWorkflowPanel
              bridgeAvailable={bridgeAvailable}
              lastScanAt={lastScanAt}
              loading={loading}
              projects={projects}
              roots={roots}
              scanErrors={scanErrors}
              unavailableRootCount={unavailableRootCount}
              onAdd={onAdd}
              onRemove={onRemove}
              onScan={onScan}
              setToast={setToast}
            />
          </div>
          <div className="settings-section-panel" hidden={activeSection !== "project-status"}>
            <div className="settings-section-heading">
              <h4>Status</h4>
              <span>{lastScanAt ? `Last scan ${formatScanTime(lastScanAt)}` : "Not scanned"}</span>
            </div>
            <SettingsStatusPanel
              projects={projects}
              roots={roots}
              scanErrors={scanErrors}
              unavailableRootCount={unavailableRootCount}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function AppearanceSettingsPanel({
  appearanceTheme,
  setToast,
  onThemeChange,
}: {
  appearanceTheme: AppearanceTheme;
  setToast: (toast: Toast) => void;
  onThemeChange: (theme: AppearanceTheme) => Promise<void>;
}) {
  const [savingTheme, setSavingTheme] = useState<AppearanceTheme | null>(null);

  async function chooseTheme(theme: AppearanceTheme) {
    if (theme === appearanceTheme || savingTheme) {
      return;
    }

    setSavingTheme(theme);
    try {
      await onThemeChange(theme);
    } catch (error) {
      setToast({ tone: "error", message: asMessage(error) });
    } finally {
      setSavingTheme(null);
    }
  }

  return (
    <section className="subpanel appearance-panel">
      <div className="compact-title-row">
        <h4>Appearance</h4>
        <span className="path-line">{appearanceDescription(appearanceTheme)}</span>
      </div>
      <div className="segmented-control" role="radiogroup" aria-label="Appearance theme">
        {appearanceThemes.map((theme) => {
          const selected = theme.id === appearanceTheme;
          return (
            <button
              aria-checked={selected}
              className={cx("segmented-option", selected && "is-selected")}
              disabled={Boolean(savingTheme)}
              key={theme.id}
              role="radio"
              type="button"
              onClick={() => void chooseTheme(theme.id)}
            >
              <span className={cx("theme-swatch", `theme-swatch-${theme.id}`)} aria-hidden="true" />
              <span>{savingTheme === theme.id ? "Saving" : theme.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function SettingsStatusPanel({
  projects,
  roots,
  scanErrors,
  unavailableRootCount,
}: {
  projects: ProjectSummary[];
  roots: RootRecord[];
  scanErrors: string[];
  unavailableRootCount: number;
}) {
  const unavailableRoots = roots.filter((root) => root.unavailable || root.available === false);

  return (
    <section className="workflow-panel settings-status-panel">
      <div className="settings-facts-grid">
        <Fact label="Roots" value={String(roots.length)} />
        <Fact label="Projects" value={String(projects.length)} />
        <Fact label="Unavailable" value={String(unavailableRootCount)} tone={unavailableRootCount ? "warn" : undefined} />
      </div>

      {unavailableRoots.length ? (
        <section className="subpanel settings-list-panel">
          <h4>Unavailable roots</h4>
          <div className="settings-list">
            {unavailableRoots.map((root) => (
              <div className="settings-list-row" key={root.path}>
                <span className="truncate">{root.path}</span>
                <small className="truncate">{root.error ?? "Unavailable"}</small>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {scanErrors.length ? (
        <section className="subpanel settings-list-panel">
          <h4>Scan issues</h4>
          <div className="settings-list">
            {scanErrors.map((error) => (
              <div className="settings-list-row" key={error}>
                <span className="truncate">{error}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {!unavailableRoots.length && !scanErrors.length ? (
        <div className="empty-state compact-title-row">
          <strong>No issues</strong>
          <span>Settings status is clear.</span>
        </div>
      ) : null}
    </section>
  );
}

function Fact({ label, value, tone }: { label: string; value: string; tone?: "warn" }) {
  return (
    <div className={cx("fact", tone === "warn" && "is-warn")}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ArrowLeftIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 24 24" width="16">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 24 24" width="16">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 24 24" width="16">
      <path d="M8 8h8v8H8z" />
    </svg>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <span>{body}</span>
    </div>
  );
}
