import { promises as fs } from "node:fs";
import path from "node:path";
import type { HarnessJsonFile, RootScanResult } from "../shared/types.js";

export const harnessJsonFiles: HarnessJsonFile[] = [
  ".agent/manifest.json",
  ".agent/state.json",
  ".agent/queue.json",
];

export type SafeRepoPath = {
  repoPath: string;
  containingRoot: string;
};

export type SafeHarnessFile = SafeRepoPath & {
  filePath: string;
  file: HarnessJsonFile;
};

export function isPathInside(parent: string, child: string): boolean {
  const relative = path.relative(parent, child);
  return relative === "" || (!!relative && !relative.startsWith("..") && !path.isAbsolute(relative));
}

export async function resolveConfiguredRoots(configuredRoots: string[]): Promise<RootScanResult[]> {
  const seen = new Set<string>();
  const results: RootScanResult[] = [];

  for (const inputPath of configuredRoots) {
    const absolute = path.resolve(inputPath);
    try {
      const real = await fs.realpath(absolute);
      const stat = await fs.stat(real);
      if (!stat.isDirectory()) {
        results.push({ inputPath, path: null, available: false, error: "Configured root is not a directory" });
        continue;
      }
      if (!seen.has(real)) {
        seen.add(real);
        results.push({ inputPath, path: real, available: true, error: null });
      }
    } catch (error) {
      results.push({
        inputPath,
        path: null,
        available: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return results;
}

export async function resolveRepoPath(repoPath: string, configuredRoots: string[]): Promise<SafeRepoPath> {
  const roots = await availableRootPaths(configuredRoots);
  if (roots.length === 0) {
    throw new Error("No configured roots are available");
  }

  const realRepo = await fs.realpath(path.resolve(repoPath));
  const stat = await fs.stat(realRepo);
  if (!stat.isDirectory()) {
    throw new Error("Repository path is not a directory");
  }

  const containingRoot = roots.find((root) => isPathInside(root, realRepo));
  if (!containingRoot) {
    throw new Error("Repository path is outside configured roots");
  }

  return { repoPath: realRepo, containingRoot };
}

export async function resolveHarnessJsonFile(
  repoPath: string,
  configuredRoots: string[],
  file: HarnessJsonFile,
): Promise<SafeHarnessFile> {
  if (!harnessJsonFiles.includes(file)) {
    throw new Error("Unsupported harness JSON file");
  }

  const safeRepo = await resolveRepoPath(repoPath, configuredRoots);
  const agentPath = path.join(safeRepo.repoPath, ".agent");
  await rejectSymlink(agentPath, ".agent directory cannot be a symlink");

  const filePath = path.join(safeRepo.repoPath, file);
  await rejectSymlink(filePath, "Harness JSON file cannot be a symlink");
  const realFile = await fs.realpath(filePath);
  const expected = path.join(safeRepo.repoPath, file);

  if (realFile !== expected) {
    throw new Error("Harness JSON file resolves away from the repository");
  }
  if (!isPathInside(safeRepo.repoPath, realFile) || !isPathInside(safeRepo.containingRoot, realFile)) {
    throw new Error("Harness JSON file is outside the allowed boundary");
  }

  return { ...safeRepo, filePath: realFile, file };
}

export async function resolveReadableHarnessJsonFile(
  repoPath: string,
  configuredRoots: string[],
  file: HarnessJsonFile,
): Promise<SafeHarnessFile> {
  if (!harnessJsonFiles.includes(file)) {
    throw new Error("Unsupported harness JSON file");
  }

  const safeRepo = await resolveRepoPath(repoPath, configuredRoots);
  const agentPath = path.join(safeRepo.repoPath, ".agent");
  await rejectSymlink(agentPath, ".agent directory cannot be a symlink");

  const filePath = path.join(safeRepo.repoPath, file);
  const expected = filePath;
  try {
    await rejectSymlink(filePath, "Harness JSON file cannot be a symlink");
  } catch (error) {
    if (!isMissingPathError(error)) throw error;
    return { ...safeRepo, filePath: expected, file };
  }

  const realFile = await fs.realpath(filePath);
  if (realFile !== expected) {
    throw new Error("Harness JSON file resolves away from the repository");
  }
  if (!isPathInside(safeRepo.repoPath, realFile) || !isPathInside(safeRepo.containingRoot, realFile)) {
    throw new Error("Harness JSON file is outside the allowed boundary");
  }

  return { ...safeRepo, filePath: realFile, file };
}

export async function resolveReadableRepoFile(
  repoPath: string,
  configuredRoots: string[],
  relativePath: string,
): Promise<string> {
  if (path.isAbsolute(relativePath) || relativePath.split(path.sep).includes("..")) {
    throw new Error("Relative file path is unsafe");
  }

  const safeRepo = await resolveRepoPath(repoPath, configuredRoots);
  const filePath = path.join(safeRepo.repoPath, relativePath);
  try {
    await rejectSymlink(filePath, "Repository file cannot be a symlink");
  } catch (error) {
    if (!isMissingPathError(error)) throw error;
    return filePath;
  }

  const realFile = await fs.realpath(filePath);
  if (!isPathInside(safeRepo.repoPath, realFile) || !isPathInside(safeRepo.containingRoot, realFile)) {
    throw new Error("Repository file is outside the allowed boundary");
  }
  return realFile;
}

export async function assertCreateTargetInsideConfiguredRoots(targetDir: string, configuredRoots?: string[]): Promise<void> {
  if (!configuredRoots || configuredRoots.length === 0) {
    throw new Error("Configured roots are required for create target validation");
  }
  const roots = await availableRootPaths(configuredRoots);
  const absoluteTarget = path.resolve(targetDir);
  await rejectExistingSymlink(absoluteTarget, "Target directory cannot be a symlink");
  const parent = await fs.realpath(path.dirname(absoluteTarget));
  const containingRoot = roots.find((root) => isPathInside(root, parent));
  if (!containingRoot) {
    throw new Error("Target directory is outside configured roots");
  }
  const existingTargetReal = await fs.realpath(absoluteTarget).catch((error) => {
    if (isMissingPathError(error)) return null;
    throw error;
  });
  if (existingTargetReal && !isPathInside(containingRoot, existingTargetReal)) {
    throw new Error("Target directory resolves outside configured roots");
  }
}

async function availableRootPaths(configuredRoots: string[]): Promise<string[]> {
  const results = await resolveConfiguredRoots(configuredRoots);
  return results.filter((root) => root.available && root.path).map((root) => root.path as string);
}

async function rejectSymlink(targetPath: string, message: string): Promise<void> {
  const stat = await fs.lstat(targetPath);
  if (stat.isSymbolicLink()) {
    throw new Error(message);
  }
}

async function rejectExistingSymlink(targetPath: string, message: string): Promise<void> {
  try {
    await rejectSymlink(targetPath, message);
  } catch (error) {
    if (isMissingPathError(error)) return;
    throw error;
  }
}

function isMissingPathError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: unknown }).code === "ENOENT";
}
