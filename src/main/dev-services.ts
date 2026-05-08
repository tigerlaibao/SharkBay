import { promises as fs } from "node:fs";
import path from "node:path";
import type { ProjectDevService } from "../shared/types.js";

type PackageJson = {
  packageManager?: unknown;
  scripts?: unknown;
};

export async function discoverProjectDevServices(projectPath: string): Promise<ProjectDevService[]> {
  const packageJson = await readPackageJson(projectPath);
  const devScript = typeof packageJson?.scripts === "object" && packageJson.scripts !== null
    ? (packageJson.scripts as Record<string, unknown>).dev
    : null;

  if (typeof devScript !== "string" || !devScript.trim()) {
    return [];
  }

  return [{
    id: "dev",
    label: "dev",
    command: await devCommandForProject(projectPath, packageJson ?? {}),
    script: devScript,
  }];
}

export async function devCommandForProject(projectPath: string, packageJson: PackageJson): Promise<string> {
  const packageManager = typeof packageJson.packageManager === "string" ? packageJson.packageManager : "";
  if (packageManager.startsWith("pnpm") || await fileExists(path.join(projectPath, "pnpm-lock.yaml"))) {
    return "pnpm dev";
  }
  if (packageManager.startsWith("yarn") || await fileExists(path.join(projectPath, "yarn.lock"))) {
    return "yarn dev";
  }
  if (packageManager.startsWith("bun") || await fileExists(path.join(projectPath, "bun.lockb"))) {
    return "bun run dev";
  }
  return "npm run dev";
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
