type GateStatus = "pass" | "pending" | "blocked" | "unknown";

type DetectionMode = "manifest" | "protocol-fallback";
type RunnerStatus = "unknown" | "idle" | "running" | "stale" | "blocked" | "waiting_for_human";

export type WorkflowProjectCandidate = {
  id: string;
  name: string;
  path: string;
  rootPath: string;
  status: "managed" | "not_setup";
  managedProjectId: string | null;
  detection: DetectionMode | null;
};

export type WorkflowProjectSummary = {
  id: string;
  name: string;
  path: string;
  detection: DetectionMode;
};

export type GateStatusCandidate = {
  gateStatus?: GateStatus | null;
  queue?: {
    backlog?: QueueTaskCandidate[];
    done?: QueueTaskCandidate[];
  } | null;
  runner?: {
    status?: RunnerStatus | string | null;
    reason?: string | null;
    message?: string | null;
    heartbeatAt?: string | null;
  } | null;
  activeTask?: {
    taskId?: string | null;
    phase?: string | null;
    status?: string | null;
    gateStatus?: GateStatus | null;
    requiresUserAction?: boolean | null;
    userActionReason?: string | null;
  } | null;
};

export type QueueTaskCandidate = {
  taskId?: string | null;
  title?: string | null;
  phase?: string | null;
  status?: string | null;
  dependsOn?: string[] | null;
};

const humanInterventionPhases = new Set(["blocked", "approval_required", "waiting_for_user", "user_action_required"]);
const runningTaskStatuses = new Set(["running", "working", "executing", "in_progress"]);

export function displayGateStatus(project: GateStatusCandidate): GateStatus {
  if (project.activeTask?.gateStatus && project.activeTask.gateStatus !== "unknown") {
    return project.activeTask.gateStatus;
  }

  if (project.gateStatus && project.gateStatus !== "unknown") {
    return project.gateStatus;
  }

  if (project.activeTask?.taskId) {
    if (project.activeTask.phase === "blocked") {
      return "blocked";
    }

    return project.activeTask.phase === "done" ? "pass" : "pending";
  }

  return "unknown";
}

export function projectNeedsUserAction(project: GateStatusCandidate): boolean {
  return userActionReason(project) !== null;
}

export function userActionReason(project: GateStatusCandidate): string | null {
  const activeTask = project.activeTask;
  if (!activeTask?.taskId) {
    return null;
  }

  const phase = activeTask.phase?.trim().toLowerCase();
  const explicitReason = normalizeUserActionReason(activeTask.userActionReason);

  if (phase === "done") {
    return null;
  }

  if (activeTask.requiresUserAction) {
    return explicitReason ?? "Action required";
  }

  if (explicitReason) {
    return explicitReason;
  }

  const runnerReason = runnerUserActionReason(project);
  if (runnerReason) {
    return runnerReason;
  }

  if (displayGateStatus(project) === "blocked") {
    return "Blocked";
  }

  if (phase && humanInterventionPhases.has(phase)) {
    return phaseLabel(phase);
  }

  return null;
}

export function agentHandoffReason(project: GateStatusCandidate): string | null {
  const activeTask = project.activeTask;
  if (activeTask?.taskId && activeTask.phase?.trim().toLowerCase() !== "done") {
    if (userActionReason(project)) {
      return null;
    }
    const runnerStatus = normalizeRunnerStatus(project.runner?.status);
    if (runnerStatus === "running") {
      return null;
    }
    if (!runnerStatus && taskIsRunning(activeTask)) {
      return null;
    }
    return "Agent handoff needed";
  }

  return nextReadyBacklogTask(project) ? "Agent handoff needed" : null;
}

export function nextReadyBacklogTask(project: GateStatusCandidate): QueueTaskCandidate | null {
  const doneTaskIds = new Set((project.queue?.done ?? []).flatMap((item) => normalizeTaskId(item.taskId) ?? []));
  return (project.queue?.backlog ?? []).find((item) => {
    const taskId = normalizeTaskId(item.taskId);
    if (!taskId) return false;
    const phase = item.phase?.trim().toLowerCase();
    const status = item.status?.trim().toLowerCase();
    if (phase === "done" || status === "done") return false;
    return (item.dependsOn ?? []).every((dependency) => doneTaskIds.has(dependency));
  }) ?? null;
}

function normalizeUserActionReason(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function taskIsRunning(task: NonNullable<GateStatusCandidate["activeTask"]>): boolean {
  const status = task.status?.trim().toLowerCase();
  return Boolean(status && runningTaskStatuses.has(status));
}

function normalizeTaskId(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function runnerUserActionReason(project: GateStatusCandidate): string | null {
  const runnerStatus = normalizeRunnerStatus(project.runner?.status);
  const reason = normalizeUserActionReason(project.runner?.reason) ?? normalizeUserActionReason(project.runner?.message);
  if (runnerStatus === "waiting_for_human") {
    return reason ?? "Waiting for human";
  }
  if (runnerStatus === "blocked") {
    return reason ?? "Runner blocked";
  }
  if (runnerStatus === "stale") {
    return reason ?? staleRunnerMessage(project.runner?.heartbeatAt);
  }
  return null;
}

function normalizeRunnerStatus(value: string | null | undefined): RunnerStatus | null {
  const normalized = value?.trim().toLowerCase();
  switch (normalized) {
    case "idle":
    case "running":
    case "stale":
    case "blocked":
    case "waiting_for_human":
    case "unknown":
      return normalized;
    default:
      return null;
  }
}

function staleRunnerMessage(heartbeatAt: string | null | undefined): string {
  return heartbeatAt ? `Runner stale since ${heartbeatAt}` : "Runner stale";
}

function phaseLabel(phase: string): string {
  return phase
    .split("_")
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

export function projectToCandidate(project: WorkflowProjectSummary): WorkflowProjectCandidate {
  return {
    id: project.id,
    name: project.name,
    path: project.path,
    rootPath: project.path,
    status: "managed",
    managedProjectId: project.id,
    detection: project.detection,
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
