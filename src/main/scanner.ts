import { promises as fs } from "node:fs";
import path from "node:path";
import type { DetectionMode, IpcRuntimeLike, ProjectCandidate, ProjectScanInput, ProjectSummary, ScanProjectsResult } from "../shared/types.js";
import { loadAppConfig, getRuntimeConfigPath } from "./config.js";
import { detectHarnessLayout } from "./harness-layout.js";
import { readProjectSummary } from "./harness-reader.js";
import { isPathInside, resolveConfiguredRoots } from "./path-safety.js";
import { resolveProjectIconSources } from "./project-icons.js";

const ignoredDirectories = new Set([
  ".git",
  ".hg",
  ".svn",
  ".cache",
  ".next",
  ".turbo",
  ".vite",
  "node_modules",
  "dist",
  "build",
  "out",
  "coverage",
]);

export type ScanOptions = {
  maxDepth?: number;
  templateDir?: string;
};

export async function scanConfiguredRoots(configuredRoots: string[], options: ScanOptions = {}): Promise<ScanProjectsResult> {
  const roots = await resolveConfiguredRoots(configuredRoots);
  const projects = new Map<string, ProjectSummary>();
  const rawCandidates = new Map<string, Omit<ProjectCandidate, "status" | "managedProjectId" | "detection">>();
  const maxDepth = options.maxDepth ?? 6;

  for (const root of roots) {
    if (!root.available || !root.path) continue;
    for (const candidate of await findRootCandidates(root.path)) {
      rawCandidates.set(candidate.path, candidate);
    }
    const candidates = await findHarnessRepos(root.path, maxDepth);
    for (const candidate of candidates) {
      if (projects.has(candidate.path)) continue;
      if (!rawCandidates.has(candidate.path)) {
        rawCandidates.set(candidate.path, candidateFromPath(candidate.path, root.path));
      }
      projects.set(candidate.path, await readProjectSummary(candidate.path, candidate.detection, [root.path], options.templateDir));
    }
  }

  const managedByPath = new Map([...projects.values()].map((project) => [project.path, project]));
  const candidates = (await Promise.all([...rawCandidates.values()]
    .map(async (candidate): Promise<ProjectCandidate> => {
      const project = managedByPath.get(candidate.path);
      return {
        ...candidate,
        iconSources: project?.iconSources ?? await resolveProjectIconSources(candidate.path, [candidate.rootPath], { localUrl: null, testUrl: null, deploymentUrl: null }),
        status: project ? "managed" : "not_setup",
        managedProjectId: project?.id ?? null,
        detection: project?.detection ?? null,
      };
    })))
    .sort((a, b) => a.name.localeCompare(b.name) || a.path.localeCompare(b.path));

  return {
    roots,
    projects: [...projects.values()].sort((a, b) => a.name.localeCompare(b.name) || a.path.localeCompare(b.path)),
    candidates,
  };
}

export async function scanProjects(runtime: IpcRuntimeLike, input?: ProjectScanInput): Promise<ScanProjectsResult> {
  const configuredRoots = (await loadAppConfig(getRuntimeConfigPath(runtime))).configuredRoots;
  return scanConfiguredRoots(configuredRoots, { maxDepth: input?.maxDepth, templateDir: runtime.templateRoot });
}

export async function findHarnessRepos(rootPath: string, maxDepth = 6): Promise<Array<{ path: string; detection: DetectionMode }>> {
  const found: Array<{ path: string; detection: DetectionMode }> = [];
  const root = await fs.realpath(rootPath);

  async function walk(directory: string, depth: number): Promise<void> {
    const detection = await detectHarnessRepo(directory);
    if (detection) {
      found.push({ path: directory, detection });
      return;
    }
    if (depth >= maxDepth) return;

    let entries: import("node:fs").Dirent[];
    try {
      entries = await fs.readdir(directory, { withFileTypes: true });
    } catch {
      return;
    }

    await Promise.all(
      entries
        .filter((entry) => entry.isDirectory() && !entry.isSymbolicLink() && !shouldIgnoreDirectory(entry.name))
        .map((entry) => walk(path.join(directory, entry.name), depth + 1)),
    );
  }

  await walk(root, 0);
  return found;
}

export async function findRootCandidates(rootPath: string): Promise<Array<Omit<ProjectCandidate, "status" | "managedProjectId" | "detection">>> {
  const root = await fs.realpath(rootPath);
  const found = new Map<string, Omit<ProjectCandidate, "status" | "managedProjectId" | "detection">>();
  const rootDetection = await detectHarnessRepo(root);

  if (rootDetection) {
    found.set(root, candidateFromPath(root, root));
  }

  let entries: import("node:fs").Dirent[];
  try {
    entries = await fs.readdir(root, { withFileTypes: true });
  } catch {
    return [...found.values()];
  }

  await Promise.all(
    entries
      .filter((entry) => entry.isDirectory() && !entry.isSymbolicLink() && !shouldIgnoreDirectory(entry.name))
      .map(async (entry) => {
        const childPath = path.join(root, entry.name);
        try {
          const realChild = await fs.realpath(childPath);
          const stat = await fs.stat(realChild);
          if (!stat.isDirectory() || !isPathInside(root, realChild)) return;
          found.set(realChild, candidateFromPath(realChild, root));
        } catch {
          // Ignore unreadable child directories; root availability is reported separately.
        }
      }),
  );

  return [...found.values()];
}

export async function detectHarnessRepo(directory: string): Promise<DetectionMode | null> {
  return (await detectHarnessLayout(directory))?.detection ?? null;
}

function candidateFromPath(candidatePath: string, rootPath: string): Omit<ProjectCandidate, "status" | "managedProjectId" | "detection"> {
  return {
    id: candidatePath,
    name: path.basename(candidatePath),
    path: candidatePath,
    rootPath,
    iconSources: [],
  };
}

function shouldIgnoreDirectory(name: string): boolean {
  if (ignoredDirectories.has(name)) return true;
  return name.startsWith(".") && name !== ".agent" && name !== ".sharkbay";
}
