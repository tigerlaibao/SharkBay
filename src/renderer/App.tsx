import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, FormEvent, KeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import type {
  AppConfig,
  CreateHarnessRepoInput,
  CreateHarnessRepoResult,
  GateStatus,
  NextActionPromptResult,
  ProjectCandidate,
  ProjectDetail,
  ProjectSummary,
  RootRecord,
  ScanResult,
  SharkBayBridge,
  TaskArtifacts,
  TaskQueueItem,
  UpdateProjectUrlsInput,
  UpdateProjectUrlsResult,
} from "./types";
import { agentHandoffReason, displayGateStatus, preferredInitialCandidate, projectNeedsUserAction, projectToCandidate, resolveSelectedCandidate, userActionReason } from "./workflow";

type View = "dashboard" | "settings";
type DetailMode = "overview" | "settings" | "decisions" | "git";

type Toast = {
  tone: "info" | "error" | "success";
  message: string;
};

type ArtifactKey = keyof TaskArtifacts;

type CopyState = "idle" | "copied" | "failed";

type SaveState = "idle" | "saving" | "saved" | "conflict" | "error";

type RefreshOptions = {
  showToast?: boolean;
  setBusy?: boolean;
};

type CandidateGroup = "managed" | "not_setup";

const defaultDetailColumnWidth = 520;
const minProjectColumnWidth = 360;
const minDetailColumnWidth = 340;
const resizerColumnWidth = 12;
const detailColumnStorageKey = "sharkbay.detailColumnWidth";

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

const workflowRequiredChecks = [
  "npm run typecheck",
  "npm run lint",
  "npm test",
  "npm run build",
  "git diff --check",
  "npm run dev",
];

const workflowStopConditions = [
  "Stop before destructive changes, production deployment, publishing, secrets, or files outside the approved scope.",
  "Stop if required verification cannot run or must be skipped.",
  "Stop if implementation needs direct Codex execution, background automation, or broader filesystem authority.",
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

function isAppConfig(value: unknown): value is AppConfig {
  return Boolean(value && typeof value === "object" && "configuredRoots" in value);
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

async function updateProjectUrls(input: UpdateProjectUrlsInput): Promise<UpdateProjectUrlsResult> {
  const bridge = getBridge();
  const handler = bridge.projects?.updateUrls ?? bridge.updateProjectUrls;

  if (!handler) {
    throw new Error("URL editing is not exposed by the preload API.");
  }

  return handler({
    ...input,
    repoPath: input.repoPath ?? "",
    configuredRoots: input.configuredRoots ?? [],
    expectedRevision: input.expectedRevision ?? "",
    urls: input.urls ?? {
      localUrl: input.localUrl,
      testUrl: input.testUrl,
      deploymentUrl: input.deploymentUrl,
    },
  });
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

async function generatePrompt(project: ProjectDetail): Promise<string> {
  const bridge = getBridge();
  const handler = bridge.prompts?.nextAction ?? bridge.generateNextActionPrompt;

  if (!handler) {
    throw new Error("Prompt generation is not exposed by the preload API.");
  }

  const result = await handler({
    project,
    projectId: project.id,
    repoPath: project.path,
    taskId: project.activeTask?.taskId,
    phase: project.activeTask?.phase,
    requiredChecks: workflowRequiredChecks,
    stopConditions: workflowStopConditions,
  });

  return typeof result === "string" ? result : (result as NextActionPromptResult).prompt;
}

function phaseOf(project: ProjectSummary): string {
  return project.activeTask?.phase || "unknown";
}

function gateOf(project: ProjectSummary): GateStatus {
  return displayGateStatus(project);
}

function projectInProgress(project: ProjectSummary): boolean {
  const phase = phaseOf(project);
  return Boolean(project.activeTask) && !["done", "blocked", "verification"].includes(phase);
}

function projectReadyToVerify(project: ProjectSummary): boolean {
  return phaseOf(project) === "verification";
}

function projectDone(project: ProjectSummary): boolean {
  return phaseOf(project) === "done";
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

function trimToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function cx(...names: Array<string | false | null | undefined>): string {
  return names.filter(Boolean).join(" ");
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

export function App() {
  const [view, setView] = useState<View>("dashboard");
  const [roots, setRoots] = useState<RootRecord[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [candidates, setCandidates] = useState<ProjectCandidate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [scanErrors, setScanErrors] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [dirtyOnly, setDirtyOnly] = useState(false);
  const [blockedOnly, setBlockedOnly] = useState(false);
  const [lastScanAt, setLastScanAt] = useState<string | null>(null);
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

  const phaseOptions = useMemo(() => {
    const phases = new Set(projects.map(phaseOf).filter((phase) => phase !== "unknown"));
    if (candidates.some((candidate) => candidate.status === "not_setup")) {
      phases.add("not_setup");
    }
    return ["all", ...Array.from(phases).sort()];
  }, [candidates, projects]);

  const filteredCandidates = useMemo(() => {
    const search = query.trim().toLowerCase();

    return candidates.filter((candidate) => {
      const project = candidate.managedProjectId ? projectById.get(candidate.managedProjectId) : null;
      const matchesSearch =
        !search ||
        candidate.name.toLowerCase().includes(search) ||
        candidate.path.toLowerCase().includes(search) ||
        (project?.activeTask?.taskId.toLowerCase().includes(search) ?? false);
      const matchesPhase = phaseFilter === "all" || (project ? phaseOf(project) === phaseFilter : phaseFilter === "not_setup");
      const matchesDirty = !dirtyOnly || project?.dirtyWorktree === true;
      const matchesBlocked = !blockedOnly || (project ? gateOf(project) === "blocked" : false);

      return matchesSearch && matchesPhase && matchesDirty && matchesBlocked;
    });
  }, [blockedOnly, candidates, dirtyOnly, phaseFilter, projectById, query]);

  async function refreshRoots() {
    setRoots(await listRoots());
  }

  async function refreshProjects(options: RefreshOptions = {}) {
    const showToast = options.showToast ?? false;
    const setBusy = options.setBusy ?? true;

    if (setBusy) {
      setLoading(true);
    }
    setScanErrors([]);

    try {
      const [rootList, scan] = await Promise.all([listRoots(), scanProjects()]);
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
    } catch (error) {
      if (showToast || setBusy) {
        setToast({ tone: "error", message: asMessage(error) });
      }
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
      setDetail(await getProjectDetail(project));
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
      await refreshProjects(options);
      if (selectedProject) {
        await refreshDetail(selectedProject, options);
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

    const timer = window.setInterval(() => {
      void refreshWorkspace({ showToast: false, setBusy: false });
    }, 5000);

    return () => window.clearInterval(timer);
  }, [bridgeAvailable, selectedProject?.id]);

  useEffect(() => {
    setDetail(null);
    void refreshDetail();
  }, [selectedProject?.id]);

  const actionProjects = projects.filter(projectNeedsUserAction);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <nav className="nav-stack" aria-label="Primary">
          <button className={cx("nav-item", view === "dashboard" && "is-active")} onClick={() => setView("dashboard")}>
            Projects
          </button>
          <button className={cx("nav-item", view === "settings" && "is-active")} onClick={() => setView("settings")}>
            Settings
          </button>
        </nav>

        {actionProjects.length ? (
          <div className="sidebar-section">
            <div className="section-heading">Needs Action</div>
            <div className="compact-list">
              {actionProjects.slice(0, 10).map((project) => (
                <button
                  aria-label={`${project.name} needs action`}
                  className={cx("compact-project", selectedProject?.id === project.id && "is-active")}
                  key={project.id}
                  onClick={() => {
                    setSelectedId(project.id);
                    setView("dashboard");
                  }}
                >
                  <span className="truncate">{project.name}</span>
                  <span aria-hidden="true" className="action-dot" />
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </aside>

      <main className="workspace">
        <div className="workspace-body">
          {toast ? (
            <div className={cx("toast", `toast-${toast.tone}`)}>
              <span>{toast.message}</span>
              <button aria-label="Dismiss" onClick={() => setToast(null)}>
                x
              </button>
            </div>
          ) : null}

          {view === "dashboard" ? (
            <DashboardView
              blockedOnly={blockedOnly}
              bridgeAvailable={bridgeAvailable}
              configuredRoots={roots.map((root) => root.path)}
              detail={detail}
              detailLoading={detailLoading}
              dirtyOnly={dirtyOnly}
              filteredCandidates={filteredCandidates}
              loading={loading}
              phaseFilter={phaseFilter}
              phaseOptions={phaseOptions}
              projectById={projectById}
              query={query}
              scanErrors={scanErrors}
              selectedCandidate={selectedCandidate}
              selectedProject={selectedProject}
              setBlockedOnly={setBlockedOnly}
              setDirtyOnly={setDirtyOnly}
              setPhaseFilter={setPhaseFilter}
              setQuery={setQuery}
              setSelectedId={setSelectedId}
              setToast={setToast}
              onDetailRefresh={refreshDetail}
              onRefresh={refreshWorkspace}
            />
          ) : null}

          {view === "settings" ? (
            <SettingsView
              roots={roots}
              bridgeAvailable={bridgeAvailable}
              lastScanAt={lastScanAt}
              loading={loading}
              projects={projects}
              scanErrors={scanErrors}
              setToast={setToast}
              onScan={() => refreshProjects({ showToast: true })}
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
            />
          ) : null}
        </div>
      </main>
    </div>
  );
}

function DashboardView({
  blockedOnly,
  bridgeAvailable,
  configuredRoots,
  detail,
  detailLoading,
  dirtyOnly,
  filteredCandidates,
  loading,
  phaseFilter,
  phaseOptions,
  projectById,
  query,
  scanErrors,
  selectedCandidate,
  selectedProject,
  setBlockedOnly,
  setDirtyOnly,
  setPhaseFilter,
  setQuery,
  setSelectedId,
  setToast,
  onDetailRefresh,
  onRefresh,
}: {
  blockedOnly: boolean;
  bridgeAvailable: boolean;
  configuredRoots: string[];
  detail: ProjectDetail | null;
  detailLoading: boolean;
  dirtyOnly: boolean;
  filteredCandidates: ProjectCandidate[];
  loading: boolean;
  phaseFilter: string;
  phaseOptions: string[];
  projectById: Map<string, ProjectSummary>;
  query: string;
  scanErrors: string[];
  selectedCandidate: ProjectCandidate | null;
  selectedProject: ProjectSummary | null;
  setBlockedOnly: (value: boolean) => void;
  setDirtyOnly: (value: boolean) => void;
  setPhaseFilter: (value: string) => void;
  setQuery: (value: string) => void;
  setSelectedId: (value: string) => void;
  setToast: (toast: Toast) => void;
  onDetailRefresh: (project?: ProjectSummary | null) => Promise<void>;
  onRefresh: () => Promise<void>;
}) {
  const managedCandidates = filteredCandidates.filter((candidate) => candidate.status === "managed");
  const notSetupCandidates = filteredCandidates.filter((candidate) => candidate.status === "not_setup");
  const [detailColumnWidth, setDetailColumnWidth] = useState(() => {
    if (typeof window === "undefined") {
      return defaultDetailColumnWidth;
    }
    const saved = Number(window.localStorage.getItem(detailColumnStorageKey));
    return Number.isFinite(saved) && saved >= minDetailColumnWidth ? saved : defaultDetailColumnWidth;
  });

  function persistDetailColumnWidth(width: number) {
    setDetailColumnWidth(width);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(detailColumnStorageKey, String(width));
    }
  }

  function resizeDetailColumn(grid: HTMLElement, clientX: number) {
    const rect = grid.getBoundingClientRect();
    const maxDetailWidth = Math.max(minDetailColumnWidth, rect.width - minProjectColumnWidth - resizerColumnWidth);
    const nextWidth = Math.min(Math.max(rect.right - clientX, minDetailColumnWidth), maxDetailWidth);
    persistDetailColumnWidth(Math.round(nextWidth));
  }

  function startColumnResize(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    const grid = event.currentTarget.parentElement;
    if (!grid) {
      return;
    }

    const onPointerMove = (moveEvent: PointerEvent) => resizeDetailColumn(grid, moveEvent.clientX);
    const onPointerUp = () => {
      document.body.classList.remove("is-resizing-columns");
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    document.body.classList.add("is-resizing-columns");
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp, { once: true });
  }

  function resizeWithKeyboard(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }
    event.preventDefault();
    const delta = event.key === "ArrowLeft" ? 40 : -40;
    persistDetailColumnWidth(Math.max(minDetailColumnWidth, detailColumnWidth + delta));
  }

  const gridStyle = {
    gridTemplateColumns: `minmax(${minProjectColumnWidth}px, 1fr) ${resizerColumnWidth}px minmax(${minDetailColumnWidth}px, ${detailColumnWidth}px)`,
  } satisfies CSSProperties;

  return (
    <div className="dashboard-grid" style={gridStyle}>
      <section className="panel project-panel">
        <div className="filter-row">
          <input
            aria-label="Filter projects"
            className="input search-input"
            placeholder="Filter by name, path, task"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select className="input select-input" value={phaseFilter} onChange={(event) => setPhaseFilter(event.target.value)}>
            {phaseOptions.map((phase) => (
              <option key={phase} value={phase}>
                {phase === "all" ? "All phases" : phase}
              </option>
            ))}
          </select>
          <label className="check-label">
            <input checked={dirtyOnly} type="checkbox" onChange={(event) => setDirtyOnly(event.target.checked)} />
            Dirty
          </label>
          <label className="check-label">
            <input checked={blockedOnly} type="checkbox" onChange={(event) => setBlockedOnly(event.target.checked)} />
            Blocked
          </label>
          <button
            aria-label="Refresh projects"
            className="icon-button"
            disabled={!bridgeAvailable || loading || detailLoading}
            title="Refresh projects"
            type="button"
            onClick={() => void onRefresh()}
          >
            <RefreshIcon />
          </button>
        </div>

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
            selectedId={selectedCandidate?.id ?? null}
            title="Managed"
            onSelect={setSelectedId}
          />
          <ProjectTable
            candidates={notSetupCandidates}
            group="not_setup"
            projectById={projectById}
            selectedId={selectedCandidate?.id ?? null}
            title="Not setup"
            onSelect={setSelectedId}
          />
        </div>
      </section>

      <div
        aria-label="Resize project and detail columns"
        aria-orientation="vertical"
        className="column-resizer"
        role="separator"
        tabIndex={0}
        onKeyDown={resizeWithKeyboard}
        onPointerDown={startColumnResize}
      />

      <section className="panel detail-panel">
        {selectedProject ? (
          <ProjectDetailPane
            configuredRoots={configuredRoots}
            detail={detail}
            project={selectedProject}
            setToast={setToast}
            onDetailRefresh={onDetailRefresh}
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

function ProjectTable({
  candidates,
  group,
  projectById,
  selectedId,
  title,
  onSelect,
}: {
  candidates: ProjectCandidate[];
  group: CandidateGroup;
  projectById: Map<string, ProjectSummary>;
  selectedId: string | null;
  title: string;
  onSelect: (id: string) => void;
}) {
  if (!candidates.length) {
    return null;
  }

  return (
    <section className={cx("project-section", `is-${group}`)}>
      <div className="project-section-title">
        <h4>{title}</h4>
        <span>{candidates.length}</span>
      </div>
      <div className="project-list" aria-label={`${title} projects`}>
        {candidates.map((candidate) => {
          const project = candidate.managedProjectId ? projectById.get(candidate.managedProjectId) : null;
          const taskTitle = activeTaskTitle(project ?? null);
          const phase = project ? phaseOf(project) : null;
          const gate = project ? gateOf(project) : null;
          const showGate = gate === "blocked";

          return (
            <button className={cx("project-row", candidate.status === "not_setup" && "is-not-setup", selectedId === candidate.id && "is-selected")} key={candidate.id} onClick={() => onSelect(candidate.id)}>
              <span className="project-row-main">
                <span className="cell-title">{candidate.name}</span>
                {taskTitle ? <span className="cell-subtitle truncate">{taskTitle}</span> : null}
                <span className="cell-subtitle truncate">{candidate.path}</span>
              </span>
              {project ? (
                <span className="project-row-status">
                  {phase && phase !== "unknown" ? <span className={cx("phase-pill", phaseClass(phase))}>{phase}</span> : null}
                  {showGate && gate ? <StatusPill status={gate} /> : null}
                  {project.dirtyWorktree !== false ? (
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
      <div className="detail-header">
        <div>
          <h3>{candidate.name}</h3>
          <div className="path-line">{candidate.path}</div>
        </div>
      </div>

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
            <p className="summary-text">This adds `.agent`, `docs`, and `tasks` files. Existing files will not be overwritten.</p>
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
  configuredRoots,
  detail,
  project,
  setToast,
  onDetailRefresh,
}: {
  configuredRoots: string[];
  detail: ProjectDetail | null;
  project: ProjectSummary;
  setToast: (toast: Toast) => void;
  onDetailRefresh: (project?: ProjectSummary | null) => Promise<void>;
}) {
  const [detailMode, setDetailMode] = useState<DetailMode>("overview");
  const resolved = detail?.id === project.id ? detail : project;
  const detailLike = resolved as ProjectDetail;
  const hasDecisions = Boolean(detailLike.recentDecisions?.length);
  const hasGitHistory = Boolean(detailLike.gitHistory?.length || detailLike.currentBranch);
  const hasDiagnostics = projectHasDiagnostics(detailLike);
  const hasActiveTask = hasMeaningfulActiveTask(detailLike.activeTask);
  const actionReason = userActionReason(detailLike);
  const handoffReason = agentHandoffReason(detailLike);
  const promptReason = actionReason ?? handoffReason;

  useEffect(() => {
    setDetailMode("overview");
  }, [project.id]);

  if (detailMode === "settings") {
    return (
      <ProjectSettingsPage
        configuredRoots={configuredRoots}
        detail={detailLike}
        project={project}
        setToast={setToast}
        onBack={() => setDetailMode("overview")}
        onDetailRefresh={onDetailRefresh}
      />
    );
  }

  if (detailMode === "decisions") {
    return (
      <HistoryPage
        title="All Decisions"
        subtitle={resolved.name}
        onBack={() => setDetailMode("overview")}
      >
        <DecisionItems decisions={detailLike.recentDecisions ?? []} limit={null} />
      </HistoryPage>
    );
  }

  if (detailMode === "git") {
    return (
      <HistoryPage
        title="Git History"
        subtitle={resolved.name}
        onBack={() => setDetailMode("overview")}
      >
        <GitHistoryItems events={detailLike.gitHistory ?? []} limit={null} />
      </HistoryPage>
    );
  }

  return (
    <div className="detail-layout">
      <div className="detail-header">
        <div>
          <h3>{resolved.name}</h3>
          <div className="path-line">{resolved.path}</div>
        </div>
        <div className="detail-actions">
          <button
            aria-label="Project settings"
            className="icon-button"
            title="Project settings"
            type="button"
            onClick={() => setDetailMode("settings")}
          >
            <SettingsIcon />
          </button>
        </div>
      </div>

      {hasActiveTask && promptReason ? <PromptPanel detail={detailLike} reason={promptReason} setToast={setToast} /> : null}
      <ArtifactViewer detail={detailLike} />
      <QueueTabs detail={detailLike} />

      {hasDecisions || hasGitHistory ? (
        <div className="history-grid">
          <DecisionList decisions={detailLike.recentDecisions ?? []} onViewAll={() => setDetailMode("decisions")} />
          <GitHistoryList currentBranch={detailLike.currentBranch} events={detailLike.gitHistory ?? []} onViewAll={() => setDetailMode("git")} />
        </div>
      ) : null}
      <Diagnostics detail={detailLike} />
      <ProjectInfoCard detail={detailLike} />
    </div>
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

function ProjectSettingsPage({
  configuredRoots,
  detail,
  project,
  setToast,
  onBack,
  onDetailRefresh,
}: {
  configuredRoots: string[];
  detail: ProjectDetail;
  project: ProjectSummary;
  setToast: (toast: Toast) => void;
  onBack: () => void;
  onDetailRefresh: (project?: ProjectSummary | null) => Promise<void>;
}) {
  return (
    <div className="detail-layout project-settings-page">
      <div className="detail-header">
        <button aria-label="Back to project" className="icon-button" title="Back to project" type="button" onClick={onBack}>
          <ArrowLeftIcon />
        </button>
        <div>
          <h3>{detail.name}</h3>
          <div className="path-line">{detail.path}</div>
        </div>
      </div>

      <UrlEditor configuredRoots={configuredRoots} detail={detail} setToast={setToast} onSaved={() => onDetailRefresh(project)} />
    </div>
  );
}

function UrlEditor({
  configuredRoots,
  detail,
  setToast,
  onSaved,
}: {
  configuredRoots: string[];
  detail: ProjectDetail;
  setToast: (toast: Toast) => void;
  onSaved: () => Promise<void> | void;
}) {
  const [urls, setUrls] = useState({
    localUrl: detail.localUrl ?? "",
    testUrl: detail.testUrl ?? "",
    deploymentUrl: detail.deploymentUrl ?? "",
  });
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setUrls({
      localUrl: detail.localUrl ?? "",
      testUrl: detail.testUrl ?? "",
      deploymentUrl: detail.deploymentUrl ?? "",
    });
  }, [detail.id, detail.localUrl, detail.testUrl, detail.deploymentUrl]);

  useEffect(() => {
    setSaveState("idle");
    setMessage("");
  }, [detail.id]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaveState("saving");
    setMessage("");

    try {
      const result = await updateProjectUrls({
        projectId: detail.id,
        repoPath: detail.path,
        configuredRoots,
        expectedRevision: detail.revisions?.state ?? null,
        localUrl: trimToNull(urls.localUrl),
        testUrl: trimToNull(urls.testUrl),
        deploymentUrl: trimToNull(urls.deploymentUrl),
      });

      if (result.conflict || result.reason === "conflict") {
        const conflictMessage = "Project links changed since this panel loaded. Refresh the project, then save again.";
        setSaveState("conflict");
        setMessage(conflictMessage);
        setToast({ tone: "error", message: "Project links changed. Refresh before retrying." });
        return;
      }

      if (result.ok === false || result.error) {
        throw new Error(result.error ?? result.message ?? "URL update failed.");
      }

      setSaveState("saved");
      setMessage("Saved. Project links are up to date.");
      setToast({ tone: "success", message: "Project links saved." });
      await onSaved();
    } catch (error) {
      setSaveState("error");
      setMessage(asMessage(error));
      setToast({ tone: "error", message: asMessage(error) });
    } finally {
      if (saveState === "saving") {
        setSaveState("idle");
      }
    }
  }

  const disabled = detail.detection === "protocol-fallback" || !detail.revisions?.state;
  const saving = saveState === "saving";

  return (
    <form className="url-editor" onSubmit={(event) => void submit(event)}>
      <div className="panel-title-row">
        <h4>Tracked URLs</h4>
        <button className="button compact" disabled={saving || disabled} type="submit">
          {saving ? "Saving" : "Save URLs"}
        </button>
      </div>
      <div className="url-fields">
        <label>
          <span>Local</span>
          <input className="input" disabled={disabled} value={urls.localUrl} onChange={(event) => setUrls({ ...urls, localUrl: event.target.value })} />
        </label>
        <label>
          <span>Test</span>
          <input className="input" disabled={disabled} value={urls.testUrl} onChange={(event) => setUrls({ ...urls, testUrl: event.target.value })} />
        </label>
        <label>
          <span>Deploy</span>
          <input className="input" disabled={disabled} value={urls.deploymentUrl} onChange={(event) => setUrls({ ...urls, deploymentUrl: event.target.value })} />
        </label>
      </div>
      {disabled ? <div className="form-note">Project links can be edited after SharkBay loads a saved project snapshot.</div> : null}
      {message ? (
        <div className={cx("feedback-line", saveState === "saved" ? "is-success" : "is-error")}>{message}</div>
      ) : null}
    </form>
  );
}

function QueueTabs({ detail }: { detail: ProjectDetail }) {
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

  const sortedItems = items.sort(compareQueueItems);

  if (!sortedItems.length) {
    return null;
  }

  return (
    <section className="subpanel">
      <div className="panel-title-row compact-title-row">
        <h4>Tasks</h4>
      </div>
      <div className="queue-list">
        {sortedItems.map((item) => (
          <QueueItem isCurrent={item.taskId === activeTaskId} item={item} key={`${item.taskId}-${item.phase ?? item.status ?? "task"}`} />
        ))}
      </div>
    </section>
  );
}

function QueueItem({ item, isCurrent }: { item: TaskQueueItem; isCurrent: boolean }) {
  const status = !isEmptyValue(item.status) ? item.status : null;
  const phase = !isEmptyValue(item.phase) ? item.phase : status;
  const title = !isEmptyValue(item.title) ? item.title : null;
  const priority = item.priority && item.priority > 0 ? `P${item.priority}` : null;
  const meta = [
    item.dependsOn?.length ? `Depends on: ${item.dependsOn.join(", ")}` : null,
  ].filter(Boolean);

  return (
    <div className={cx("queue-item", priority && "has-priority", isCurrent && "is-current")}>
      {priority ? <span className="queue-priority">{priority}</span> : null}
      <span>
        <strong>{item.taskId}</strong>
        {title ? <small>{title}</small> : null}
        {meta.length ? <small>{meta.join(" / ")}</small> : null}
      </span>
      {phase ? <span className={cx("phase-pill", phaseClass(phase))}>{phase}</span> : null}
    </div>
  );
}

function PromptPanel({ detail, reason, setToast }: { detail: ProjectDetail; reason: string | null; setToast: (toast: Toast) => void }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>("idle");

  useEffect(() => {
    setPrompt("");
    setCopyState("idle");
  }, [detail.id, detail.activeTask?.taskId, detail.activeTask?.phase, reason]);

  async function loadPrompt() {
    setLoading(true);
    setCopyState("idle");

    try {
      setPrompt(await generatePrompt(detail));
    } catch (error) {
      setToast({ tone: "error", message: asMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function copyPrompt() {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard write is not available. Select the prompt text manually.");
      }
      await navigator.clipboard.writeText(prompt);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1500);
    } catch (error) {
      setCopyState("failed");
      setToast({ tone: "error", message: asMessage(error) });
    }
  }

  return (
    <section className="subpanel prompt-panel">
      <div className="panel-title-row">
        <h4>{reason === "Agent handoff needed" ? "Agent Handoff" : "Needs Action"}</h4>
        <div className="button-row">
          <button className="button compact secondary" disabled={loading} onClick={() => void loadPrompt()}>
            {loading ? "Generating" : "Generate"}
          </button>
          {prompt ? (
            <button className="button compact" onClick={() => void copyPrompt()}>
              {copyState === "copied" ? "✓ Copied" : "Copy"}
            </button>
          ) : null}
        </div>
      </div>
      {copyState === "failed" ? (
        <div className="feedback-line is-error">Clipboard copy failed. The prompt remains selectable below.</div>
      ) : null}
      {prompt ? <textarea className="prompt-box" readOnly value={prompt} /> : null}
    </section>
  );
}

function taskPanelTitle(detail: ProjectDetail): string {
  const task = detail.activeTask;
  if (!hasMeaningfulActiveTask(task)) {
    return "Task";
  }

  const shortId = task.taskId.match(/^t-(\d+)/i)?.[1];
  const displayId = shortId ? `T${shortId}` : task.taskId;
  return !isEmptyValue(task.title) ? `${displayId}: ${task.title}` : displayId;
}

function ArtifactViewer({ detail }: { detail: ProjectDetail }) {
  const artifacts = detail.currentTask ?? null;
  const activeKey = artifactOrder.find((key) => Boolean(artifacts?.[key]?.trim()));
  const current = activeKey ? artifacts?.[activeKey] || "" : "";

  if (!activeKey) {
    return null;
  }

  return (
    <section className="subpanel artifact-panel">
      <div className="panel-title-row">
        <h4>{taskPanelTitle(detail)}</h4>
      </div>
      <pre className="artifact-view">{current}</pre>
    </section>
  );
}

function HistoryPage({
  children,
  onBack,
  subtitle,
  title,
}: {
  children: ReactNode;
  onBack: () => void;
  subtitle: string;
  title: string;
}) {
  return (
    <div className="detail-layout history-page">
      <div className="detail-header">
        <button aria-label="Back to project" className="icon-button" title="Back to project" type="button" onClick={onBack}>
          <ArrowLeftIcon />
        </button>
        <div>
          <h3>{title}</h3>
          <div className="path-line">{subtitle}</div>
        </div>
      </div>
      <section className="subpanel">{children}</section>
    </div>
  );
}

function DecisionList({ decisions, onViewAll }: { decisions: ProjectDetail["recentDecisions"]; onViewAll: () => void }) {
  if (!decisions?.length) {
    return null;
  }

  return (
    <section className="subpanel">
      <div className="panel-title-row compact-title-row">
        <h4>Recent Decisions</h4>
        {decisions.length > 5 ? (
          <button className="link-button" type="button" onClick={onViewAll}>
            View all
          </button>
        ) : null}
      </div>
      <DecisionItems decisions={decisions} limit={5} />
    </section>
  );
}

function DecisionItems({ decisions, limit }: { decisions: ProjectDetail["recentDecisions"]; limit: number | null }) {
  const sorted = [...(decisions ?? [])].reverse();
  const visible = limit === null ? sorted : sorted.slice(0, limit);

  return (
    <div className="decision-list">
      {visible.map((decision) => (
        <div className="decision-item" key={`${decision.date}-${decision.source}-${decision.decision}`}>
          <div className="decision-meta">{decision.source}</div>
          <div>{decision.decision}</div>
          <div className="history-time" title={formatHistoryTime(decision.date)}>
            {formatRelativeTime(decision.date)}
          </div>
        </div>
      ))}
    </div>
  );
}

function GitHistoryList({
  currentBranch,
  events,
  onViewAll,
}: {
  currentBranch: string | null | undefined;
  events: ProjectDetail["gitHistory"];
  onViewAll: () => void;
}) {
  if (!events?.length && !currentBranch) {
    return null;
  }

  return (
    <section className="subpanel">
      <div className="panel-title-row compact-title-row">
        <h4>Git History</h4>
        {(events?.length ?? 0) > 5 ? (
          <button className="link-button" type="button" onClick={onViewAll}>
            View all
          </button>
        ) : null}
      </div>
      <GitHistoryItems events={events ?? []} limit={5} />
    </section>
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
  roots,
  bridgeAvailable,
  lastScanAt,
  loading,
  projects,
  scanErrors,
  setToast,
  onScan,
  onAdd,
  onRemove,
}: {
  roots: RootRecord[];
  bridgeAvailable: boolean;
  lastScanAt: string | null;
  loading: boolean;
  projects: ProjectSummary[];
  scanErrors: string[];
  setToast: (toast: Toast) => void;
  onScan: () => Promise<void>;
  onAdd: (path: string) => Promise<void>;
  onRemove: (path: string) => Promise<void>;
}) {
  const unavailableRootCount = roots.filter((root) => root.unavailable || root.available === false).length;

  return (
    <div className="settings-layout">
      <section className="panel settings-panel">
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
      </section>
    </div>
  );
}

function Fact({ label, value, tone }: { label: string; value: string; tone?: "warn" }) {
  return (
    <div className={cx("fact", tone === "warn" && "is-warn")}>
      <span>{label}</span>
      <strong className="truncate">{value}</strong>
    </div>
  );
}

function StatusPill({ status }: { status: GateStatus }) {
  return <span className={cx("status-pill", `status-${status}`)}>{status}</span>;
}

function SettingsIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 24 24" width="16">
      <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 0 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.3 7A2 2 0 0 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 0 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1a2 2 0 0 1 0 4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 24 24" width="16">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 24 24" width="16">
      <path d="M20 6v5h-5" />
      <path d="M4 18v-5h5" />
      <path d="M18.6 9A7 7 0 0 0 6.4 6.6L4 9" />
      <path d="M5.4 15a7 7 0 0 0 12.2 2.4L20 15" />
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
