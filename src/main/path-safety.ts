import { promises as fs } from "node:fs";
import path from "node:path";

export type SafeRepoPath = {
  repoPath: string;
  containingRoot: string;
};

export function isPathInside(parent: string, child: string): boolean {
  const relative = path.relative(parent, child);
  return relative === "" || (!!relative && !relative.startsWith("..") && !path.isAbsolute(relative));
}

export async function resolveRepoPath(repoPath: string, configuredProjects: string[]): Promise<SafeRepoPath> {
  const realRepo = await fs.realpath(path.resolve(repoPath));
  const stat = await fs.stat(realRepo);
  if (!stat.isDirectory()) {
    throw new Error("Repository path is not a directory");
  }

  for (const projectPath of configuredProjects) {
    try {
      const realProject = await fs.realpath(path.resolve(projectPath));
      if (realRepo === realProject || isPathInside(realProject, realRepo)) {
        return { repoPath: realRepo, containingRoot: realProject };
      }
    } catch {
      // Skip unresolvable project paths.
    }
  }

  if (configuredProjects.length === 0) {
    throw new Error("No configured projects are available");
  }
  throw new Error("Repository path is outside configured projects");
}

export async function resolveReadableRepoFile(
  repoPath: string,
  configuredProjects: string[],
  relativePath: string,
): Promise<string> {
  if (path.isAbsolute(relativePath) || relativePath.split(path.sep).includes("..")) {
    throw new Error("Relative file path is unsafe");
  }

  const safeRepo = await resolveRepoPath(repoPath, configuredProjects);
  const filePath = path.join(safeRepo.repoPath, relativePath);
  try {
    const stat = await fs.lstat(filePath);
    if (stat.isSymbolicLink()) {
      throw new Error("Repository file cannot be a symlink");
    }
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code?: unknown }).code === "ENOENT") {
      return filePath;
    }
    throw error;
  }

  const realFile = await fs.realpath(filePath);
  if (!isPathInside(safeRepo.repoPath, realFile) || !isPathInside(safeRepo.containingRoot, realFile)) {
    throw new Error("Repository file is outside the allowed boundary");
  }
  return realFile;
}
