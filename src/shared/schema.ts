import type { DevelopmentEndpoint, DevelopmentMetadata, DevelopmentPort, QueueSection, RunnerSummary, TaskQueueItem, UrlFields } from "./types.js";

export type ValidationResult = {
  ok: boolean;
  errors: string[];
};

const queueSections: QueueSection[] = ["active", "backlog", "done"];
const urlFields = ["localUrl", "testUrl", "deploymentUrl"] as const;
const endpointSections = ["local", "test", "production"] as const;
const runnerStatuses = ["idle", "running", "blocked", "waiting_for_human"] as const;
const editableUrlSchemes = new Set(["http:", "https:"]);
export const runnerStaleAfterSeconds = 300;
type RunnerStoredStatus = (typeof runnerStatuses)[number];

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || ["unknown", "none", "null", "unset"].includes(trimmed.toLowerCase())) return null;
  return trimmed;
}

export function normalizeEditableUrl(value: unknown): { ok: true; value: string | null } | { ok: false; error: string } {
  const normalized = normalizeUrl(value);
  if (normalized === null) return { ok: true, value: null };

  try {
    const parsed = new URL(normalized);
    if (!editableUrlSchemes.has(parsed.protocol)) {
      return { ok: false, error: `Unsupported URL scheme: ${parsed.protocol}` };
    }
    return { ok: true, value: normalized };
  } catch {
    return { ok: false, error: `Invalid URL: ${normalized}` };
  }
}

export function normalizeUrlFields(source: unknown): UrlFields {
  if (!isRecord(source)) {
    return { localUrl: null, testUrl: null, deploymentUrl: null };
  }

  return {
    localUrl: normalizeUrl(source.localUrl),
    testUrl: normalizeUrl(source.testUrl),
    deploymentUrl: normalizeUrl(source.deploymentUrl),
  };
}

export function normalizeDevelopmentMetadata(source: unknown): DevelopmentMetadata | null {
  if (!isRecord(source)) return null;
  return {
    schemaVersion: typeof source.schemaVersion === "number" ? source.schemaVersion : null,
    updatedAt: normalizeString(source.updatedAt),
    maintainedBy: normalizeString(source.maintainedBy),
    stack: normalizeStringArrayRecord(source.stack),
    environment: normalizeEnvironment(source.environment),
    commands: normalizeStringArrayRecord(source.commands),
    endpoints: normalizeEndpoints(source.endpoints),
    ports: Array.isArray(source.ports) ? source.ports.flatMap(normalizePort) : [],
    tools: normalizeStringArray(source.tools),
    notes: normalizeStringArray(source.notes),
  };
}

export function normalizeRunnerMetadata(source: unknown, nowMs = Date.now(), staleAfterSeconds = runnerStaleAfterSeconds): RunnerSummary {
  if (!isRecord(source)) return emptyRunnerSummary(staleAfterSeconds);
  const rawStatus = normalizeString(source.status);
  const status: RunnerStoredStatus | null = runnerStatuses.includes(rawStatus as RunnerStoredStatus) ? rawStatus as RunnerStoredStatus : null;
  const heartbeatAt = normalizeString(source.heartbeatAt);
  const stale = status === "running" && isStaleHeartbeat(heartbeatAt, nowMs, staleAfterSeconds);
  return {
    schemaVersion: typeof source.schemaVersion === "number" ? source.schemaVersion : null,
    status: stale ? "stale" : status ?? "unknown",
    rawStatus: rawStatus,
    sessionId: normalizeString(source.sessionId),
    owner: normalizeString(source.owner),
    taskId: normalizeString(source.taskId),
    phase: normalizeString(source.phase),
    startedAt: normalizeString(source.startedAt),
    heartbeatAt,
    message: normalizeString(source.message),
    reason: normalizeString(source.reason),
    stale,
    staleAfterSeconds,
  };
}

export function emptyRunnerSummary(staleAfterSeconds = runnerStaleAfterSeconds): RunnerSummary {
  return {
    schemaVersion: null,
    status: "unknown",
    rawStatus: null,
    sessionId: null,
    owner: null,
    taskId: null,
    phase: null,
    startedAt: null,
    heartbeatAt: null,
    message: null,
    reason: null,
    stale: false,
    staleAfterSeconds,
  };
}

export function validateManifestJson(data: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isRecord(data)) {
    return { ok: false, errors: ["manifest must be an object"] };
  }
  if (data.schemaVersion !== undefined && typeof data.schemaVersion !== "number") {
    errors.push("schemaVersion must be a number when present");
  }
  for (const key of ["harness", "project", "repository", "runtime"]) {
    if (data[key] !== undefined && !isRecord(data[key])) {
      errors.push(`${key} must be an object when present`);
    }
  }
  if (isRecord(data.runtime)) {
    validateUrlContainer(data.runtime, "runtime", errors);
  }
  return { ok: errors.length === 0, errors };
}

export function validateRunnerJson(data: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isRecord(data)) {
    return { ok: false, errors: ["runner must be an object"] };
  }
  if (data.schemaVersion !== undefined && typeof data.schemaVersion !== "number") {
    errors.push("schemaVersion must be a number when present");
  }
  if (!runnerStatuses.includes(data.status as (typeof runnerStatuses)[number])) {
    errors.push(`status must be one of: ${runnerStatuses.join(", ")}`);
  }
  for (const key of ["sessionId", "owner", "taskId", "phase", "startedAt", "heartbeatAt", "message", "reason"]) {
    if (data[key] !== undefined && data[key] !== null && typeof data[key] !== "string") {
      errors.push(`${key} must be a string or null when present`);
    }
  }
  return { ok: errors.length === 0, errors };
}

export function validateDevelopmentJson(data: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isRecord(data)) {
    return { ok: false, errors: ["development metadata must be an object"] };
  }
  if (data.schemaVersion !== undefined && typeof data.schemaVersion !== "number") {
    errors.push("schemaVersion must be a number when present");
  }
  for (const key of ["updatedAt", "maintainedBy"]) {
    if (data[key] !== undefined && data[key] !== null && typeof data[key] !== "string") {
      errors.push(`${key} must be a string when present`);
    }
  }
  validateStringArrayRecord(data.stack, "stack", errors);
  validateEnvironment(data.environment, errors);
  validateStringArrayRecord(data.commands, "commands", errors);
  validateEndpoints(data.endpoints, errors);
  validatePorts(data.ports, errors);
  validateStringArray(data.tools, "tools", errors);
  validateStringArray(data.notes, "notes", errors);
  return { ok: errors.length === 0, errors };
}

export function validateStateJson(data: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isRecord(data)) {
    return { ok: false, errors: ["state must be an object"] };
  }
  if (data.schemaVersion !== undefined && typeof data.schemaVersion !== "number") {
    errors.push("schemaVersion must be a number when present");
  }
  for (const key of ["repository", "project", "currentTask"]) {
    if (data[key] !== undefined && !isRecord(data[key])) {
      errors.push(`${key} must be an object when present`);
    }
  }
  if (isRecord(data.project)) {
    validateUrlContainer(data.project, "project", errors);
  }
  if (data.recentDecisions !== undefined) {
    if (!Array.isArray(data.recentDecisions)) {
      errors.push("recentDecisions must be an array when present");
    } else {
      data.recentDecisions.forEach((item, index) => {
        if (!isRecord(item)) {
          errors.push(`recentDecisions[${index}] must be an object`);
          return;
        }
        for (const key of ["date", "decision", "source"]) {
          if (typeof item[key] !== "string") {
            errors.push(`recentDecisions[${index}].${key} must be a string`);
          }
        }
      });
    }
  }
  return { ok: errors.length === 0, errors };
}

export function validateQueueJson(data: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isRecord(data)) {
    return { ok: false, errors: ["queue must be an object"] };
  }
  if (data.schemaVersion !== undefined && typeof data.schemaVersion !== "number") {
    errors.push("schemaVersion must be a number when present");
  }
  for (const section of queueSections) {
    if (!Array.isArray(data[section])) {
      errors.push(`${section} must be an array`);
      continue;
    }
    (data[section] as unknown[]).forEach((item, index) => validateTaskItem(item, `${section}[${index}]`, errors));
  }
  return { ok: errors.length === 0, errors };
}

export function validateTaskItem(item: unknown, label = "task", errors: string[] = []): ValidationResult {
  if (!isRecord(item)) {
    errors.push(`${label} must be an object`);
    return { ok: false, errors };
  }
  for (const key of ["taskId", "title", "phase", "status"]) {
    if (typeof item[key] !== "string") {
      errors.push(`${label}.${key} must be a string`);
    }
  }
  if (item.priority !== undefined && typeof item.priority !== "number") {
    errors.push(`${label}.priority must be a number when present`);
  }
  if (item.dependsOn !== undefined && (!Array.isArray(item.dependsOn) || !item.dependsOn.every((value) => typeof value === "string"))) {
    errors.push(`${label}.dependsOn must be an array of strings when present`);
  }
  return { ok: errors.length === 0, errors };
}

export function asQueueItem(value: unknown): TaskQueueItem | null {
  if (!isRecord(value)) return null;
  const taskId = typeof value.taskId === "string" ? value.taskId : null;
  const title = typeof value.title === "string" ? value.title : null;
  const phase = typeof value.phase === "string" ? value.phase : null;
  const status = typeof value.status === "string" ? value.status : null;
  if (!taskId || !title || !phase || !status) return null;

  return {
    ...value,
    taskId,
    title,
    phase,
    status,
    priority: typeof value.priority === "number" ? value.priority : undefined,
    dependsOn: Array.isArray(value.dependsOn) && value.dependsOn.every((item) => typeof item === "string") ? value.dependsOn : [],
  };
}

function validateUrlContainer(container: Record<string, unknown>, label: string, errors: string[]): void {
  for (const field of urlFields) {
    if (container[field] !== undefined && container[field] !== null && typeof container[field] !== "string") {
      errors.push(`${label}.${field} must be a string or null when present`);
    }
  }
}

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || ["unknown", "none", "null", "unset"].includes(trimmed.toLowerCase())) return null;
  return trimmed;
}

function isStaleHeartbeat(heartbeatAt: string | null, nowMs: number, staleAfterSeconds: number): boolean {
  if (!heartbeatAt) return true;
  const heartbeatMs = Date.parse(heartbeatAt);
  if (!Number.isFinite(heartbeatMs)) return true;
  return nowMs - heartbeatMs > staleAfterSeconds * 1000;
}

function normalizeStringArray(value: unknown): string[] {
  const single = normalizeString(value);
  if (single) return [single];
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const normalized = normalizeString(item);
    return normalized ? [normalized] : [];
  });
}

function normalizeStringArrayRecord(value: unknown): Record<string, string[]> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .map(([key, item]) => [key, normalizeStringArray(item)] as const)
      .filter(([, items]) => items.length > 0),
  );
}

function normalizeEnvironment(value: unknown): DevelopmentMetadata["environment"] {
  if (!isRecord(value)) {
    return { packageManager: null, setupCommands: [], requiredEnvFiles: [] };
  }
  return {
    packageManager: normalizeString(value.packageManager),
    setupCommands: normalizeStringArray(value.setupCommands),
    requiredEnvFiles: normalizeStringArray(value.requiredEnvFiles),
  };
}

function normalizeEndpoints(value: unknown): DevelopmentMetadata["endpoints"] {
  const endpoints: DevelopmentMetadata["endpoints"] = { local: [], test: [], production: [] };
  if (!isRecord(value)) return endpoints;
  for (const section of endpointSections) {
    endpoints[section] = Array.isArray(value[section]) ? value[section].flatMap(normalizeEndpoint) : [];
  }
  return endpoints;
}

function normalizeEndpoint(value: unknown): DevelopmentEndpoint[] {
  const single = normalizeString(value);
  if (single) {
    const url = normalizeUrl(single);
    return [{ label: url ?? single, url, ports: [], source: null }];
  }
  if (!isRecord(value)) return [];
  const label = normalizeString(value.label);
  const url = normalizeUrl(value.url);
  const ports = Array.isArray(value.ports) ? value.ports.filter((port): port is number => Number.isInteger(port) && port > 0) : [];
  if (!label && !url && ports.length === 0) return [];
  return [{ label: label ?? url ?? `Port ${ports[0]}`, url, ports, source: normalizeString(value.source) }];
}

function normalizePort(value: unknown): DevelopmentPort[] {
  if (Number.isInteger(value) && (value as number) > 0) {
    return [{ port: value as number, protocol: null, purpose: null, status: null }];
  }
  if (!isRecord(value) || typeof value.port !== "number" || !Number.isInteger(value.port) || value.port <= 0) return [];
  return [{
    port: value.port,
    protocol: normalizeString(value.protocol),
    purpose: normalizeString(value.purpose),
    status: normalizeString(value.status),
  }];
}

function validateStringArrayRecord(value: unknown, label: string, errors: string[]): void {
  if (value === undefined) return;
  if (!isRecord(value)) {
    errors.push(`${label} must be an object when present`);
    return;
  }
  for (const [key, item] of Object.entries(value)) {
    validateStringArray(item, `${label}.${key}`, errors);
  }
}

function validateStringArray(value: unknown, label: string, errors: string[]): void {
  if (value === undefined) return;
  if (typeof value === "string") return;
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    errors.push(`${label} must be a string or an array of strings when present`);
  }
}

function validateEnvironment(value: unknown, errors: string[]): void {
  if (value === undefined) return;
  if (!isRecord(value)) {
    errors.push("environment must be an object when present");
    return;
  }
  if (value.packageManager !== undefined && value.packageManager !== null && typeof value.packageManager !== "string") {
    errors.push("environment.packageManager must be a string when present");
  }
  validateStringArray(value.setupCommands, "environment.setupCommands", errors);
  validateStringArray(value.requiredEnvFiles, "environment.requiredEnvFiles", errors);
}

function validateEndpoints(value: unknown, errors: string[]): void {
  if (value === undefined) return;
  if (!isRecord(value)) {
    errors.push("endpoints must be an object when present");
    return;
  }
  for (const section of endpointSections) {
    const items = value[section];
    if (items === undefined) continue;
    if (!Array.isArray(items)) {
      errors.push(`endpoints.${section} must be an array when present`);
      continue;
    }
    items.forEach((item, index) => validateEndpoint(item, `endpoints.${section}[${index}]`, errors));
  }
}

function validateEndpoint(value: unknown, label: string, errors: string[]): void {
  if (typeof value === "string") return;
  if (!isRecord(value)) {
    errors.push(`${label} must be a string or an object`);
    return;
  }
  for (const key of ["label", "url", "source"]) {
    if (value[key] !== undefined && value[key] !== null && typeof value[key] !== "string") {
      errors.push(`${label}.${key} must be a string when present`);
    }
  }
  if (value.ports !== undefined && (!Array.isArray(value.ports) || !value.ports.every((port) => Number.isInteger(port)))) {
    errors.push(`${label}.ports must be an array of numbers when present`);
  }
}

function validatePorts(value: unknown, errors: string[]): void {
  if (value === undefined) return;
  if (!Array.isArray(value)) {
    errors.push("ports must be an array when present");
    return;
  }
  value.forEach((item, index) => {
    if (Number.isInteger(item)) {
      return;
    }
    if (!isRecord(item)) {
      errors.push(`ports[${index}] must be a number or an object`);
      return;
    }
    if (!Number.isInteger(item.port)) {
      errors.push(`ports[${index}].port must be a number`);
    }
    for (const key of ["protocol", "purpose", "status"]) {
      if (item[key] !== undefined && item[key] !== null && typeof item[key] !== "string") {
        errors.push(`ports[${index}].${key} must be a string when present`);
      }
    }
  });
}
