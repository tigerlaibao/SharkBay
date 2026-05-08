import { promises as fs } from "node:fs";
import path from "node:path";
import type { ProjectDevService } from "../shared/types.js";

type PackageJson = {
  packageManager?: unknown;
  scripts?: unknown;
};

const ignoredServiceDirectories = new Set([
  ".git",
  ".next",
  ".turbo",
  ".vite",
  "node_modules",
  "dist",
  "build",
  "out",
  "coverage",
]);

export async function discoverProjectDevServices(projectPath: string): Promise<ProjectDevService[]> {
  const services = await servicesFromPackage(projectPath, "root");
  const children = await directChildDirectories(projectPath);

  for (const childPath of children) {
    services.push(...await servicesFromPackage(childPath, path.basename(childPath)));
  }

  return services;
}

export async function devCommandForProject(projectPath: string, packageJson: PackageJson): Promise<string> {
  return scriptCommandForProject(projectPath, packageJson, "dev");
}

export async function scriptCommandForProject(projectPath: string, packageJson: PackageJson, scriptName: string): Promise<string> {
  const packageManager = typeof packageJson.packageManager === "string" ? packageJson.packageManager : "";
  if (packageManager.startsWith("pnpm") || await fileExists(path.join(projectPath, "pnpm-lock.yaml"))) {
    return `pnpm ${scriptName}`;
  }
  if (packageManager.startsWith("yarn") || await fileExists(path.join(projectPath, "yarn.lock"))) {
    return `yarn ${scriptName}`;
  }
  if (packageManager.startsWith("bun") || await fileExists(path.join(projectPath, "bun.lockb"))) {
    return `bun run ${scriptName}`;
  }
  return `npm run ${scriptName}`;
}

async function servicesFromPackage(projectPath: string, idPrefix: string): Promise<ProjectDevService[]> {
  const packageJson = await readPackageJson(projectPath);
  const scripts = typeof packageJson?.scripts === "object" && packageJson.scripts !== null
    ? packageJson.scripts as Record<string, unknown>
    : {};
  const services: ProjectDevService[] = [];

  for (const [scriptName, script] of Object.entries(scripts)) {
    if (scriptName !== "dev" && !scriptName.startsWith("dev:")) {
      continue;
    }
    if (typeof script !== "string" || !script.trim()) {
      continue;
    }
    services.push({
      id: `${idPrefix}:${scriptName}`,
      label: scriptName === "dev" ? `dev: ${script.trim()}` : scriptName,
      command: await scriptCommandForProject(projectPath, packageJson ?? {}, scriptName),
      script,
      cwd: projectPath,
    });
  }

  return services;
}

async function readPackageJson(projectPath: string): Promise<PackageJson | null> {
  try {
    const raw = await fs.readFile(path.join(projectPath, "package.json"), "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return typeof parsed === "object" && parsed !== null ? parsed as PackageJson : null;
  } catch {
    return null;
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}

async function directChildDirectories(projectPath: string): Promise<string[]> {
  let entries: import("node:fs").Dirent[];
  try {
    entries = await fs.readdir(projectPath, { withFileTypes: true });
  } catch {
    return [];
  }

  const directories: string[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.isSymbolicLink() || shouldIgnoreServiceDirectory(entry.name)) {
      continue;
    }
    directories.push(path.join(projectPath, entry.name));
  }
  return directories.sort((a, b) => a.localeCompare(b));
}

function shouldIgnoreServiceDirectory(name: string): boolean {
  return ignoredServiceDirectories.has(name) || name.startsWith(".");
}
