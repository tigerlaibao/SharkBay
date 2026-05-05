import { isRecord, normalizeEditableUrl, validateManifestJson, validateQueueJson, validateStateJson } from "../shared/schema.js";
import type {
  HarnessWriteFailure,
  HarnessJsonFile,
  HarnessJsonPatchInput,
  HarnessPatch,
  HarnessWriteInput,
  HarnessWriteResult,
  IpcRuntimeLike,
  QueueTaskPatch,
  StateUrlsPatch,
  UpdateProjectUrlsInput,
} from "../shared/types.js";
import { loadAppConfig, getRuntimeConfigPath } from "./config.js";
import { readJsonFile, writeJsonAtomic } from "./json-file.js";
import { resolveHarnessJsonFile } from "./path-safety.js";

export function updateProjectUrls(input: UpdateProjectUrlsInput): Promise<HarnessWriteResult>;
export function updateProjectUrls(runtime: IpcRuntimeLike, input: UpdateProjectUrlsInput): Promise<HarnessWriteResult>;
export async function updateProjectUrls(
  first: UpdateProjectUrlsInput | IpcRuntimeLike,
  second?: UpdateProjectUrlsInput,
): Promise<HarnessWriteResult> {
  const input = await normalizeUrlsInput(first, second);
  const stateResult = await applyHarnessPatch({
    repoPath: input.repoPath,
    configuredRoots: input.configuredRoots,
    file: ".agent/state.json",
    expectedRevision: input.expectedRevision,
    patch: { type: "updateProjectUrls", urls: input.urls },
  });

  return stateResult;
}

export async function updateHarnessState(runtime: IpcRuntimeLike, input: HarnessJsonPatchInput): Promise<HarnessWriteResult> {
  return applyRuntimePatch(runtime, ".agent/state.json", input);
}

export async function updateHarnessManifest(runtime: IpcRuntimeLike, input: HarnessJsonPatchInput): Promise<HarnessWriteResult> {
  return applyRuntimePatch(runtime, ".agent/manifest.json", input);
}

export async function updateHarnessQueue(runtime: IpcRuntimeLike, input: HarnessJsonPatchInput): Promise<HarnessWriteResult> {
  return applyRuntimePatch(runtime, ".agent/queue.json", input);
}

export async function applyHarnessPatch(input: HarnessWriteInput): Promise<HarnessWriteResult> {
  if (!isPatchSupportedForFile(input.file, input.patch)) {
    return {
      ok: false,
      reason: "unsupported-patch",
      message: `Patch ${input.patch.type} is not supported for ${input.file}`,
    };
  }

  let filePath: string;
  try {
    filePath = (await resolveHarnessJsonFile(input.repoPath, input.configuredRoots, input.file)).filePath;
  } catch (error) {
    return failure("unsafe-path", error);
  }

  const current = await readJsonFile(filePath);
  if (!current.ok) {
    return {
      ok: false,
      reason: current.reason === "invalid-json" ? "invalid-json" : "io-error",
      message: current.message,
      latestRevision: current.revision ?? undefined,
    };
  }

  if (current.revision !== input.expectedRevision) {
    return {
      ok: false,
      reason: "conflict",
      message: "The harness JSON file changed since it was read",
      latestRevision: current.revision,
      latestData: current.data,
    };
  }

  let next: unknown;
  try {
    next = applyPatchToData(input.file, current.data, input.patch);
  } catch (error) {
    return failure(isValidationLikeError(error) ? "invalid-schema" : "unsupported-patch", error);
  }

  const validation = validateForFile(input.file, next);
  if (!validation.ok) {
    return {
      ok: false,
      reason: "invalid-schema",
      message: "Updated harness JSON failed validation",
      errors: validation.errors,
    };
  }

  try {
    const revision = await writeJsonAtomic(filePath, next);
    const reread = await readJsonFile(filePath);
    if (!reread.ok) {
      return {
        ok: false,
        reason: reread.reason === "invalid-json" ? "invalid-json" : "io-error",
        message: reread.message,
        latestRevision: reread.revision ?? undefined,
      };
    }
    return {
      ok: true,
      file: input.file,
      revision,
      data: reread.data,
    };
  } catch (error) {
    return failure("io-error", error);
  }
}

function applyPatchToData(file: HarnessJsonFile, data: unknown, patch: HarnessPatch): unknown {
  if (!isRecord(data)) {
    throw new Error("Harness JSON root must be an object");
  }
  const next = structuredClone(data) as Record<string, unknown>;

  switch (patch.type) {
    case "updateProjectUrls":
      ensureObject(next, "project");
      applyUrlPatch(next.project as Record<string, unknown>, patch);
      next.updatedAt = today();
      return next;
    case "updateGitMirror":
      ensureObject(next, "repository");
      Object.assign(next.repository as Record<string, unknown>, patch.repository);
      next.updatedAt = today();
      return next;
    case "updateCurrentTask":
      ensureObject(next, "currentTask");
      Object.assign(next.currentTask as Record<string, unknown>, patch.currentTask);
      next.updatedAt = today();
      return next;
    case "appendRecentDecision":
      next.recentDecisions = Array.isArray(next.recentDecisions) ? [...next.recentDecisions, patch.decision] : [patch.decision];
      next.updatedAt = today();
      return next;
    case "updateManifestIdentity":
      if (patch.project) {
        ensureObject(next, "project");
        Object.assign(next.project as Record<string, unknown>, patch.project);
      }
      if (patch.repository) {
        ensureObject(next, "repository");
        Object.assign(next.repository as Record<string, unknown>, patch.repository);
      }
      return next;
    case "updateManifestRuntimeUrls":
      if (!isRecord(next.runtime)) return next;
      for (const key of ["localUrl", "testUrl", "deploymentUrl"] as const) {
        if (Object.prototype.hasOwnProperty.call(next.runtime, key) && key in patch.urls) {
          const normalized = normalizeEditableUrl(patch.urls[key]);
          if (!normalized.ok) throw new Error(normalized.error);
          next.runtime[key] = normalized.value;
        }
      }
      return next;
    case "updateQueueTask":
      applyQueueTaskPatch(next, patch);
      next.updatedAt = today();
      return next;
    default:
      throw new Error(`Unsupported patch for ${file}`);
  }
}

function applyUrlPatch(target: Record<string, unknown>, patch: StateUrlsPatch): void {
  for (const key of ["localUrl", "testUrl", "deploymentUrl"] as const) {
    if (!(key in patch.urls)) continue;
    const normalized = normalizeEditableUrl(patch.urls[key]);
    if (!normalized.ok) throw new Error(normalized.error);
    target[key] = normalized.value;
  }
}

async function applyRuntimePatch(
  runtime: IpcRuntimeLike,
  file: HarnessJsonFile,
  input: HarnessJsonPatchInput,
): Promise<HarnessWriteResult> {
  const configuredRoots = (await loadAppConfig(getRuntimeConfigPath(runtime))).configuredRoots;
  return applyHarnessPatch({
    ...input,
    file,
    configuredRoots,
  });
}

async function normalizeUrlsInput(
  first: UpdateProjectUrlsInput | IpcRuntimeLike,
  second?: UpdateProjectUrlsInput,
): Promise<UpdateProjectUrlsInput> {
  if (second) {
    const configuredRoots = (await loadAppConfig(getRuntimeConfigPath(first as IpcRuntimeLike))).configuredRoots;
    return {
      ...second,
      configuredRoots,
    };
  }
  return first as UpdateProjectUrlsInput;
}

function applyQueueTaskPatch(data: Record<string, unknown>, patch: QueueTaskPatch): void {
  const section = data[patch.section];
  if (!Array.isArray(section)) {
    throw new Error(`Queue section ${patch.section} must be an array`);
  }
  const index = section.findIndex((item) => isRecord(item) && item.taskId === patch.taskId);
  if (index === -1) {
    throw new Error(`Task ${patch.taskId} not found in ${patch.section}`);
  }
  section[index] = {
    ...(section[index] as Record<string, unknown>),
    ...patch.changes,
  };
}

function isPatchSupportedForFile(file: HarnessJsonFile, patch: HarnessPatch): boolean {
  if (file === ".agent/state.json") {
    return ["updateProjectUrls", "updateGitMirror", "updateCurrentTask", "appendRecentDecision"].includes(patch.type);
  }
  if (file === ".agent/manifest.json") {
    return ["updateManifestIdentity", "updateManifestRuntimeUrls"].includes(patch.type);
  }
  if (file === ".agent/queue.json") {
    return patch.type === "updateQueueTask";
  }
  return false;
}

function validateForFile(file: HarnessJsonFile, data: unknown) {
  if (file === ".agent/state.json") return validateStateJson(data);
  if (file === ".agent/manifest.json") return validateManifestJson(data);
  return validateQueueJson(data);
}

function ensureObject(target: Record<string, unknown>, key: string): void {
  if (!isRecord(target[key])) {
    target[key] = {};
  }
}

function failure(reason: HarnessWriteFailure["reason"], error: unknown): HarnessWriteResult {
  return {
    ok: false,
    reason,
    message: error instanceof Error ? error.message : String(error),
  };
}

function isValidationLikeError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.startsWith("Invalid URL") || message.startsWith("Unsupported URL scheme");
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
