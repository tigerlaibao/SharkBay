type DetectionMode = "manifest" | "protocol-fallback";

export type WorkflowProjectCandidate = {
  id: string;
  name: string;
  path: string;
  rootPath: string;
  iconSources?: Array<{ kind: "local" | "favicon"; url: string; label: string }>;
  status: "managed" | "not_setup";
  managedProjectId: string | null;
  detection: DetectionMode | null;
  services?: Array<{ id: string; label: string; command: string; script: string; cwd: string }>;
};

export type WorkflowProjectTerminalActivityState = "working" | "idle";

export type WorkflowTerminalActivityTab = {
  activityState: "idle" | "working" | "done";
  session: {
    service?: unknown;
  };
};

export type WorkflowTerminalActivitySpace = {
  projectId: string;
  tabs: WorkflowTerminalActivityTab[];
};

export type WorkflowProjectSummary = {
  id: string;
  name: string;
  path: string;
  detection: DetectionMode;
  iconSources?: Array<{ kind: "local" | "favicon"; url: string; label: string }>;
};

export function validTerminalResizeDimensions(cols: number | null | undefined, rows: number | null | undefined): boolean {
  return typeof cols === "number"
    && typeof rows === "number"
    && Number.isFinite(cols)
    && Number.isFinite(rows)
    && Math.floor(cols) >= 1
    && Math.floor(rows) >= 1;
}

export function projectToCandidate(project: WorkflowProjectSummary): WorkflowProjectCandidate {
  return {
    id: project.id,
    name: project.name,
    path: project.path,
    rootPath: project.path,
    iconSources: project.iconSources ?? [],
    status: "managed",
    managedProjectId: project.id,
    detection: project.detection,
    services: [],
  };
}

export function projectSummaryFromDetail<
  T extends {
    queue?: unknown;
    currentTask?: unknown;
    taskArtifacts?: unknown;
    recentDecisions?: unknown;
    gitHistory?: unknown;
    development?: unknown;
    revisions?: unknown;
  },
>(detail: T): Omit<T, "queue" | "currentTask" | "taskArtifacts" | "recentDecisions" | "gitHistory" | "development" | "revisions"> {
  const {
    queue: _queue,
    currentTask: _currentTask,
    taskArtifacts: _taskArtifacts,
    recentDecisions: _recentDecisions,
    gitHistory: _gitHistory,
    development: _development,
    revisions: _revisions,
    ...summary
  } = detail;

  return summary;
}

export function resolveSelectedCandidate(
  candidates: WorkflowProjectCandidate[],
  projectsById: Map<string, WorkflowProjectSummary>,
  selectedId: string | null,
): WorkflowProjectCandidate | null {
  const candidate = candidates.find((item) => item.id === selectedId);
  if (candidate) {
    return candidate;
  }

  const project = selectedId ? projectsById.get(selectedId) : null;
  if (project) {
    return projectToCandidate(project);
  }

  return preferredInitialCandidate(candidates);
}

export function preferredInitialCandidate(candidates: WorkflowProjectCandidate[]): WorkflowProjectCandidate | null {
  return candidates.find((item) => item.status === "managed") ?? candidates[0] ?? null;
}

export function terminalActivityForCandidate(
  candidate: Pick<WorkflowProjectCandidate, "id" | "managedProjectId" | "path">,
  statesByProjectId: Record<string, WorkflowProjectTerminalActivityState>,
): WorkflowProjectTerminalActivityState | null {
  return statesByProjectId[candidate.id]
    ?? (candidate.managedProjectId ? statesByProjectId[candidate.managedProjectId] : undefined)
    ?? statesByProjectId[candidate.path]
    ?? null;
}

export function shouldResetTerminalObservationForInput(data: string): boolean {
  return data !== "\u001b[I" && data !== "\u001b[O";
}

export function projectTerminalActivityStates(
  spaces: Iterable<WorkflowTerminalActivitySpace>,
): Record<string, WorkflowProjectTerminalActivityState> {
  const nextStates: Record<string, WorkflowProjectTerminalActivityState> = {};
  for (const space of spaces) {
    const activityTabs = space.tabs.filter((tab) => !tab.session.service);
    if (activityTabs.some((tab) => tab.activityState === "working")) {
      nextStates[space.projectId] = "working";
    } else if (activityTabs.some((tab) => tab.activityState === "done")) {
      nextStates[space.projectId] = "idle";
    }
  }
  return nextStates;
}
