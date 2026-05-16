import { promises as fs } from "node:fs";
import path from "node:path";
import type { IpcRuntimeLike, ProjectCandidate, ScanProjectsResult } from "../shared/types.js";
import { loadAppConfig, getRuntimeConfigPath } from "./config.js";
import { discoverProjectDevServices } from "./dev-services.js";
import { readGitMetadata } from "./git.js";
import { resolveProjectIconSources } from "./project-icons.js";

export async function scanProjects(runtime: IpcRuntimeLike): Promise<ScanProjectsResult> {
  const config = await loadAppConfig(getRuntimeConfigPath(runtime));
  return { candidates: await resolveManualProjects(config.configuredProjects) };
}

async function resolveManualProjects(configuredProjects: string[]): Promise<ProjectCandidate[]> {
  const candidates: ProjectCandidate[] = [];

  for (const projectPath of configuredProjects) {
    try {
      const real = await fs.realpath(path.resolve(projectPath));
      const stat = await fs.stat(real);
      if (!stat.isDirectory()) continue;

      const name = path.basename(real);
      const [iconSources, services, gitMetadata] = await Promise.all([
        resolveProjectIconSources(real, [real]),
        discoverProjectDevServices(real),
        readGitMetadata(real),
      ]);
      candidates.push({
        id: real,
        name,
        path: real,
        rootPath: real,
        iconSources,
        services,
        dirtyWorktree: gitMetadata.dirtyWorktree,
      });
    } catch {
      // Skip projects that can't be resolved (missing, permission errors, etc.)
    }
  }

  return candidates.sort((a, b) => a.name.localeCompare(b.name));
}
