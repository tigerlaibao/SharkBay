import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type {
  HarnessTemplateOwnedFile,
  HarnessTemplateSyncCheckInput,
  HarnessTemplateSyncCheckResult,
  HarnessTemplateSyncMetadata,
  HarnessTemplateSyncUpdateInput,
  HarnessTemplateSyncUpdateResult,
} from "../shared/types.js";
import { readJsonFile, writeJsonAtomic } from "./json-file.js";
import { isPathInside, resolveRepoPath } from "./path-safety.js";

export const harnessTemplateSyncMetadataPath = ".agent/template-sync.json";
export const versionOwnedHarnessTemplateFiles = [
  "AGENTS.md",
  ".agent/protocol.md",
  ".agent/quality-rules.md",
] as const;

type VersionOwnedPath = (typeof versionOwnedHarnessTemplateFiles)[number];

type TemplateSyncPlan = {
  version: string;
  files: Array<HarnessTemplateOwnedFile & { content: string }>;
};

export async function checkHarnessTemplateSync(input: HarnessTemplateSyncCheckInput): Promise<HarnessTemplateSyncCheckResult> {
  let plan: TemplateSyncPlan;
  try {
    plan = await readTemplateSyncPlan(resolveTemplateDir(input.templateDir));
  } catch (error) {
    return failure("template-missing", error);
  }

  let repoPath: string;
  try {
    repoPath = (await resolveRepoPath(input.repoPath, input.configuredRoots ?? [input.repoPath])).repoPath;
  } catch (error) {
    return failure("unsafe-path", error);
  }

  const metadataPath = path.join(repoPath, harnessTemplateSyncMetadataPath);
  let metadata: HarnessTemplateSyncMetadata | null;
  try {
    metadata = await readInstalledMetadata(repoPath);
  } catch (error) {
    return failure("unsafe-path", error);
  }
  const files = [];

  for (const templateFile of plan.files) {
    const installedPath = path.join(repoPath, templateFile.path);
    try {
      await assertSafeRepoFile(repoPath, templateFile.path);
      const installedContent = await fs.readFile(installedPath, "utf8");
      const installedSha256 = sha256(installedContent);
      files.push({
        path: templateFile.path,
        sha256: templateFile.sha256,
        installedSha256,
        status: installedSha256 === templateFile.sha256 ? "current" as const : "stale" as const,
      });
    } catch (error) {
      if (!isMissingPathError(error)) return failure("unsafe-path", error);
      files.push({
        path: templateFile.path,
        sha256: templateFile.sha256,
        installedSha256: null,
        status: "missing" as const,
      });
    }
  }

  const hasMissing = files.some((file) => file.status === "missing");
  const hasStale = files.some((file) => file.status === "stale");
  const status = hasMissing ? "missing" : hasStale ? "stale" : "current";

  return {
    ok: true,
    repoPath,
    status,
    currentVersion: plan.version,
    installedVersion: metadata?.version ?? null,
    metadataPath,
    files,
  };
}

export async function updateHarnessTemplateFiles(input: HarnessTemplateSyncUpdateInput): Promise<HarnessTemplateSyncUpdateResult> {
  let plan: TemplateSyncPlan;
  try {
    plan = await readTemplateSyncPlan(resolveTemplateDir(input.templateDir));
  } catch (error) {
    return failure("template-missing", error);
  }

  let repoPath: string;
  try {
    repoPath = (await resolveRepoPath(input.repoPath, input.configuredRoots ?? [input.repoPath])).repoPath;
  } catch (error) {
    return failure("unsafe-path", error);
  }

  try {
    const written: string[] = [];
    for (const templateFile of plan.files) {
      await assertSafeRepoFile(repoPath, templateFile.path);
      const target = path.join(repoPath, templateFile.path);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, templateFile.content, { encoding: "utf8", mode: 0o600 });
      written.push(templateFile.path);
    }

    const metadataPath = await writeTemplateSyncMetadata(repoPath, plan);
    written.push(harnessTemplateSyncMetadataPath);

    return {
      ok: true,
      repoPath,
      status: "current",
      version: plan.version,
      files: written.sort(),
      metadataPath,
    };
  } catch (error) {
    return failure(isMissingPathError(error) ? "io-error" : "unsafe-path", error);
  }
}

export async function writeCurrentTemplateSyncMetadata(repoPath: string, templateDir?: string): Promise<{ version: string; metadataPath: string }> {
  const plan = await readTemplateSyncPlan(resolveTemplateDir(templateDir));
  return { version: plan.version, metadataPath: await writeTemplateSyncMetadata(path.resolve(repoPath), plan) };
}

async function readTemplateSyncPlan(templateDir: string): Promise<TemplateSyncPlan> {
  const files = await Promise.all(
    versionOwnedHarnessTemplateFiles.map(async (relativePath) => {
      const content = await fs.readFile(path.join(templateDir, relativePath), "utf8");
      return { path: relativePath, content, sha256: sha256(content) };
    }),
  );
  const version = sha256(files.map((file) => `${file.path}\0${file.sha256}`).sort().join("\n"));
  return { version, files };
}

async function writeTemplateSyncMetadata(repoPath: string, plan: TemplateSyncPlan): Promise<string> {
  await assertSafeRepoFile(repoPath, harnessTemplateSyncMetadataPath);
  const metadata: HarnessTemplateSyncMetadata = {
    schemaVersion: 1,
    source: "sharkbay/templates/harness",
    version: plan.version,
    updatedAt: new Date().toISOString(),
    versionOwnedFiles: plan.files.map(({ path, sha256 }) => ({ path, sha256 })).sort((a, b) => a.path.localeCompare(b.path)),
  };
  const metadataPath = path.join(repoPath, harnessTemplateSyncMetadataPath);
  await fs.mkdir(path.dirname(metadataPath), { recursive: true });
  await writeJsonAtomic(metadataPath, metadata);
  return metadataPath;
}

async function readInstalledMetadata(repoPath: string): Promise<HarnessTemplateSyncMetadata | null> {
  const metadataPath = path.join(repoPath, harnessTemplateSyncMetadataPath);
  try {
    await assertSafeRepoFile(repoPath, harnessTemplateSyncMetadataPath);
  } catch (error) {
    if (isMissingPathError(error)) return null;
    throw error;
  }

  const result = await readJsonFile(metadataPath);
  if (!result.ok || !isTemplateSyncMetadata(result.data)) return null;
  return result.data;
}

async function assertSafeRepoFile(repoPath: string, relativePath: string): Promise<void> {
  assertSafeRelativePath(relativePath);
  const normalizedRepo = path.resolve(repoPath);
  const targetPath = path.join(normalizedRepo, relativePath);
  if (!isPathInside(normalizedRepo, targetPath)) {
    throw new Error("Template sync file is outside the repository");
  }

  await rejectExistingSymlink(targetPath, "Template sync file cannot be a symlink");
  await rejectExistingSymlink(path.dirname(targetPath), "Template sync parent directory cannot be a symlink");
}

function assertSafeRelativePath(relativePath: string): asserts relativePath is VersionOwnedPath | typeof harnessTemplateSyncMetadataPath {
  if (path.isAbsolute(relativePath) || relativePath.split(/[\\/]+/).includes("..")) {
    throw new Error("Template sync file path is unsafe");
  }
  if (relativePath !== harnessTemplateSyncMetadataPath && !versionOwnedHarnessTemplateFiles.includes(relativePath as VersionOwnedPath)) {
    throw new Error("Template sync file is not version-owned");
  }
}

async function rejectExistingSymlink(targetPath: string, message: string): Promise<void> {
  try {
    const stat = await fs.lstat(targetPath);
    if (stat.isSymbolicLink()) throw new Error(message);
  } catch (error) {
    if (isMissingPathError(error)) return;
    throw error;
  }
}

function isTemplateSyncMetadata(value: unknown): value is HarnessTemplateSyncMetadata {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    record.schemaVersion === 1 &&
    record.source === "sharkbay/templates/harness" &&
    typeof record.version === "string" &&
    typeof record.updatedAt === "string" &&
    Array.isArray(record.versionOwnedFiles)
  );
}

function resolveTemplateDir(templateDir?: string): string {
  return path.resolve(templateDir || path.join(process.cwd(), "templates", "harness"));
}

function sha256(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

function failure(reason: "unsafe-path" | "template-missing" | "io-error", error: unknown): HarnessTemplateSyncCheckResult & HarnessTemplateSyncUpdateResult {
  return {
    ok: false,
    reason,
    message: error instanceof Error ? error.message : String(error),
  };
}

function isMissingPathError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: unknown }).code === "ENOENT";
}
