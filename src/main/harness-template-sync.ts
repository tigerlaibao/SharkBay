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
import { detectHarnessLayout, harnessLayouts, layoutForKind, type HarnessLayout } from "./harness-layout.js";
import { readJsonFile, writeJsonAtomic } from "./json-file.js";
import { isPathInside, resolveRepoPath } from "./path-safety.js";

export const harnessTemplateSyncMetadataPath = ".sharkbay/template-sync.json";
export const versionOwnedHarnessTemplateFiles = [
  "AGENTS.md",
  ".sharkbay/protocol.md",
  ".sharkbay/quality-rules.md",
] as const;

type VersionOwnedPath = (typeof versionOwnedHarnessTemplateFiles)[number];

type TemplateSyncPlan = {
  version: string;
  files: Array<HarnessTemplateOwnedFile & { content: string; logicalPath: "AGENTS.md" | "protocol.md" | "quality-rules.md" }>;
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

  let layout: HarnessLayout;
  try {
    layout = await detectTargetLayout(repoPath);
  } catch (error) {
    return failure("unsafe-path", error);
  }
  const metadataPath = path.join(repoPath, layout.templateSyncJson);
  let metadata: HarnessTemplateSyncMetadata | null;
  try {
    metadata = await readInstalledMetadata(repoPath, layout);
  } catch (error) {
    return failure("unsafe-path", error);
  }
  const files = [];

  for (const templateFile of plan.files) {
    const targetPath = versionOwnedTargetPath(layout, templateFile.logicalPath);
    const installedPath = path.join(repoPath, targetPath);
    try {
      await assertSafeRepoFile(repoPath, targetPath, layout);
      const installedContent = await fs.readFile(installedPath, "utf8");
      const installedSha256 = sha256(installedContent);
      files.push({
        path: targetPath,
        sha256: templateFile.sha256,
        installedSha256,
        status: installedSha256 === templateFile.sha256 ? "current" as const : "stale" as const,
      });
    } catch (error) {
      if (!isMissingPathError(error)) return failure("unsafe-path", error);
      files.push({
        path: targetPath,
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
    const layout = await detectTargetLayout(repoPath);
    const written: string[] = [];
    for (const templateFile of plan.files) {
      const targetPath = versionOwnedTargetPath(layout, templateFile.logicalPath);
      await assertSafeRepoFile(repoPath, targetPath, layout);
      const target = path.join(repoPath, targetPath);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, templateFile.content, { encoding: "utf8", mode: 0o600 });
      written.push(targetPath);
    }

    const metadataPath = await writeTemplateSyncMetadata(repoPath, layout, plan);
    written.push(layout.templateSyncJson);

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
  const resolvedRepoPath = path.resolve(repoPath);
  const layout = await detectTargetLayout(resolvedRepoPath);
  return { version: plan.version, metadataPath: await writeTemplateSyncMetadata(resolvedRepoPath, layout, plan) };
}

async function readTemplateSyncPlan(templateDir: string): Promise<TemplateSyncPlan> {
  const templateLayout = await detectTemplateLayout(templateDir);
  const specs = [
    { logicalPath: "AGENTS.md" as const, path: "AGENTS.md" },
    { logicalPath: "protocol.md" as const, path: templateLayout.protocolMarkdown },
    { logicalPath: "quality-rules.md" as const, path: templateLayout.qualityRulesMarkdown },
  ];
  const files = await Promise.all(
    specs.map(async (spec) => {
      const content = await fs.readFile(path.join(templateDir, spec.path), "utf8");
      return { path: spec.path, logicalPath: spec.logicalPath, content, sha256: sha256(content) };
    }),
  );
  const version = sha256(files.map((file) => `${file.logicalPath}\0${file.sha256}`).sort().join("\n"));
  return { version, files };
}

async function writeTemplateSyncMetadata(repoPath: string, layout: HarnessLayout, plan: TemplateSyncPlan): Promise<string> {
  await assertSafeRepoFile(repoPath, layout.templateSyncJson, layout);
  const metadata: HarnessTemplateSyncMetadata = {
    schemaVersion: 1,
    source: "sharkbay/templates/harness",
    version: plan.version,
    updatedAt: new Date().toISOString(),
    versionOwnedFiles: plan.files
      .map(({ logicalPath, sha256 }) => ({ path: versionOwnedTargetPath(layout, logicalPath), sha256 }))
      .sort((a, b) => a.path.localeCompare(b.path)),
  };
  const metadataPath = path.join(repoPath, layout.templateSyncJson);
  await fs.mkdir(path.dirname(metadataPath), { recursive: true });
  await writeJsonAtomic(metadataPath, metadata);
  return metadataPath;
}

async function readInstalledMetadata(repoPath: string, layout: HarnessLayout): Promise<HarnessTemplateSyncMetadata | null> {
  const metadataPath = path.join(repoPath, layout.templateSyncJson);
  try {
    await assertSafeRepoFile(repoPath, layout.templateSyncJson, layout);
  } catch (error) {
    if (isMissingPathError(error)) return null;
    throw error;
  }

  const result = await readJsonFile(metadataPath);
  if (!result.ok || !isTemplateSyncMetadata(result.data)) return null;
  return result.data;
}

async function assertSafeRepoFile(repoPath: string, relativePath: string, layout: HarnessLayout): Promise<void> {
  assertSafeRelativePath(relativePath, layout);
  const normalizedRepo = path.resolve(repoPath);
  const targetPath = path.join(normalizedRepo, relativePath);
  if (!isPathInside(normalizedRepo, targetPath)) {
    throw new Error("Template sync file is outside the repository");
  }

  await rejectExistingSymlink(targetPath, "Template sync file cannot be a symlink");
  await rejectExistingSymlink(path.dirname(targetPath), "Template sync parent directory cannot be a symlink");
}

function assertSafeRelativePath(relativePath: string, layout: HarnessLayout): asserts relativePath is VersionOwnedPath | typeof harnessTemplateSyncMetadataPath {
  if (path.isAbsolute(relativePath) || relativePath.split(/[\\/]+/).includes("..")) {
    throw new Error("Template sync file path is unsafe");
  }
  const allowed = [
    "AGENTS.md",
    layout.protocolMarkdown,
    layout.qualityRulesMarkdown,
    layout.templateSyncJson,
  ];
  if (!allowed.includes(relativePath)) {
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

async function detectTargetLayout(repoPath: string): Promise<HarnessLayout> {
  const detected = await detectHarnessLayout(repoPath);
  if (!detected) throw new Error("Repository does not contain a supported harness layout");
  return detected.layout;
}

async function detectTemplateLayout(templateDir: string): Promise<HarnessLayout> {
  for (const layout of harnessLayouts) {
    try {
      const stat = await fs.lstat(path.join(templateDir, layout.rootDir));
      if (stat.isDirectory() && !stat.isSymbolicLink()) return layout;
    } catch {
      // Try the next layout.
    }
  }
  return layoutForKind("contained");
}

function versionOwnedTargetPath(layout: HarnessLayout, logicalPath: "AGENTS.md" | "protocol.md" | "quality-rules.md"): string {
  if (logicalPath === "AGENTS.md") return "AGENTS.md";
  if (logicalPath === "protocol.md") return layout.protocolMarkdown;
  return layout.qualityRulesMarkdown;
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
